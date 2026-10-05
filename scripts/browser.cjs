"use strict";
const { createServer } = require("node:http");
const { spawn } = require("node:child_process");
const {
  readFileSync,
  existsSync,
  mkdtempSync,
  rmSync,
  mkdirSync,
  writeFileSync,
} = require("node:fs");
const { resolve, join, extname, sep } = require("node:path");
const { tmpdir } = require("node:os");
const { setTimeout: delay } = require("node:timers/promises");
async function withBrowser(
  {
    root = process.cwd(),
    pageURL,
    onEvent,
    shots,
    initScript,
    reducedMotion = false,
    viewport = { width: 1100, height: 580, deviceScaleFactor: 1, mobile: false },
  } = {},
  run,
) {
  const executable =
    process.env.CHROME_BIN ||
    [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/usr/bin/google-chrome",
    ].find(existsSync);
  if (!executable) throw new Error("Set CHROME_BIN to a Chrome/Chromium executable.");
  root = resolve(root);
  const server = createServer((req, res) => {
    const name =
      decodeURIComponent(new URL(req.url, "http://localhost").pathname.slice(1)) || "index.html";
    const path = resolve(root, name);
    if (!path.startsWith(root + sep) || !existsSync(path)) {
      res.writeHead(404);
      res.end();
      return;
    }
    let body;
    try {
      body = readFileSync(path);
    } catch {
      res.writeHead(404);
      res.end();
      return;
    }
    res.setHeader(
      "Content-Type",
      {
        ".webp": "image/webp",
        ".png": "image/png",
        ".html": "text/html",
        ".css": "text/css",
        ".json": "application/json",
      }[extname(name)] || "text/javascript",
    );
    res.end(body);
  });
  const profile = mkdtempSync(join(tmpdir(), "goldmining-browser-")),
    pending = new Map(),
    errors = [];
  let child,
    socket,
    sequence = 0,
    timer;
  async function send(method, params = {}) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error(method + " timed out"));
      }, 15000);
      pending.set(id, { resolve, reject, timer: timeout });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const out = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (out.exceptionDetails)
      throw new Error(out.exceptionDetails.exception?.description || out.exceptionDetails.text);
    return out.result.value;
  }
  async function waitFor(expression) {
    for (let i = 0; i < 120; i++) {
      if (await evaluate(expression)) return;
      await delay(50);
    }
    throw new Error("Never reached: " + expression);
  }
  async function click(id) {
    const point = await evaluate(
      `(()=>{let el=document.getElementById(${JSON.stringify(id)});if(el.matches('input[type="radio"]'))el=el.closest('label');el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`,
    );
    await send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      ...point,
      button: "left",
      clickCount: 1,
    });
    await send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      ...point,
      button: "left",
      clickCount: 1,
    });
  }
  async function key(key, code = key, modifiers = 0) {
    const windowsVirtualKeyCode =
      key === "Tab" ? 9 : key === " " ? 32 : key === "ArrowDown" ? 40 : 0;
    await send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key,
      code,
      modifiers,
      windowsVirtualKeyCode,
    });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, modifiers });
  }
  async function capture(name) {
    const { data } = await send("Page.captureScreenshot");
    const bytes = Buffer.from(data, "base64");
    if (shots && name) {
      mkdirSync(shots, { recursive: true });
      writeFileSync(join(shots, name + ".png"), bytes);
    }
    return bytes;
  }
  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    child = spawn(
      executable,
      [
        "--headless=new",
        "--no-sandbox",
        "--remote-debugging-port=0",
        `--user-data-dir=${profile}`,
        "about:blank",
      ],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    timer = setTimeout(() => {
      child?.kill("SIGKILL");
      socket?.close();
    }, 180000);
    const endpoint = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code) => reject(new Error("Browser exited: " + code)));
      let log = "";
      child.stderr.on("data", (chunk) => {
        log += chunk;
        const match = log.match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) resolve(new URL(match[1]));
      });
    });
    const targets = await (await fetch(`http://${endpoint.host}/json/list`)).json();
    socket = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    socket.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method) onEvent?.(msg);
      if (msg.method === "Runtime.exceptionThrown")
        errors.push(
          msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text,
        );
      if (
        msg.method === "Runtime.consoleAPICalled" &&
        ["error", "warning"].includes(msg.params.type)
      )
        errors.push(msg.params.args.map((a) => a.value || a.description).join(" "));
      const task = pending.get(msg.id);
      if (!task) return;
      pending.delete(msg.id);
      clearTimeout(task.timer);
      if (msg.error) task.reject(new Error(msg.error.message));
      else task.resolve(msg.result);
    });
    await send("Runtime.enable");
    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", viewport);
    if (reducedMotion)
      await send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      });
    if (initScript) await send("Page.addScriptToEvaluateOnNewDocument", { source: initScript });
    const url = pageURL ?? `http://127.0.0.1:${server.address().port}/`;
    await send("Page.navigate", { url });
    return await run({
      send,
      evaluate,
      click,
      key,
      waitFor,
      capture,
      screenshot: capture,
      errors,
      url,
      delay,
    });
  } finally {
    clearTimeout(timer);
    for (const task of pending.values()) clearTimeout(task.timer);
    socket?.close();
    child?.kill("SIGKILL");
    child?.stderr.destroy();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    rmSync(profile, { recursive: true, force: true, maxRetries: 6, retryDelay: 100 });
  }
}
module.exports = { withBrowser };
