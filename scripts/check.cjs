"use strict";
const { readdirSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");
function sources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? sources(join(dir, e.name))
      : /\.(c?js)$/.test(e.name)
        ? [join(dir, e.name)]
        : [],
  );
}
const files = ["smoke-check.cjs", ...["src", "scripts"].flatMap(sources)];
for (const file of files) {
  const r = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (r.status) {
    process.stderr.write(r.stderr);
    process.exit(r.status || 1);
  }
}
console.log("Syntax checked " + files.length + " native sources.");
