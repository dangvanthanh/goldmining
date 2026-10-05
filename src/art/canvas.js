// Shared Canvas 2D helpers for the procedural art providers.
export function shape(c, points, fill, stroke, width = 1) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke();
  }
}
// stops: [[offset, color], …] on a unit radial gradient scaled to rx × ry.
export function glow(c, x, y, rx, ry, stops) {
  c.save();
  c.translate(x, y);
  c.scale(rx, ry);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
  stops.forEach(([at, color]) => g.addColorStop(at, color));
  c.fillStyle = g;
  c.fillRect(-1, -1, 2, 2);
  c.restore();
}
