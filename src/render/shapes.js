import { shape } from "../art/canvas.js";
export function createShapes(ctx) {
  const GLOW = document.createElement("canvas");
  GLOW.width = GLOW.height = 128;
  (function paintGlowSprite() {
    const c = GLOW.getContext("2d"),
      g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,231,170,1)");
    g.addColorStop(0.22, "rgba(255,197,105,.72)");
    g.addColorStop(0.55, "rgba(255,150,55,.2)");
    g.addColorStop(1, "rgba(255,130,40,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
  })();
  function polygon(points, fill, stroke, width = 2) {
    shape(ctx, points, fill, stroke, width);
  }
  function ellipse(x, y, rx, ry, fill) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }
  function line(points, color, width = 2) {
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  function drawGlow(x, y, r, now, { spread = 4.6, base = 0.42, aspect = 1 } = {}) {
    const pulse = 0.72 + Math.sin(now * 0.0031 + x * 0.045 + y * 0.027) * 0.28;
    const s = r * spread * (0.86 + pulse * 0.22);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = base * pulse;
    ctx.drawImage(GLOW, x - s / 2, y - (s * aspect) / 2, s, s * aspect);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  return { polygon, ellipse, line, drawGlow, GLOW };
}
