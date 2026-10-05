import { RULES, isGold } from "../core/levels.js";
import { FEEL, SKY } from "../art/constants.js";
import { createFacets } from "./facets.js";
export function createObjectPainter({ ctx, assets, constants: visual, calm, clock, shapes }) {
  const { polygon, ellipse, line, drawGlow } = shapes,
    { objectAspect } = RULES;
  let frame; // { state, view } of the object being drawn
  const details = new WeakMap();
  function decorate(obj) {
    let d = details.get(obj);
    if (!d || d.level !== frame.state.level) {
      d = { level: frame.state.level, facets: createFacets(frame.state.level, obj) };
      details.set(obj, d);
    }
    return { ...obj, ...d.facets };
  }
  // Moving pig: painted sprite, or the procedural fallback.
  function drawPig(obj, paint) {
    const { r } = paint,
      phase = (RULES.roundSeconds - frame.state.time) * obj.speed * 0.2,
      stride = obj.taken ? 0 : Math.sin(phase);
    ctx.scale(obj.direction, 1);
    const pig = assets?.sprites.pig;
    if (pig) {
      const width = r * 2,
        height = (width * pig.height) / pig.width;
      const bob = obj.taken ? 0 : -Math.abs(Math.cos(phase)) * 0.8,
        top = -height * 0.55 + bob;
      if (obj.taken) ctx.drawImage(pig, -width / 2, top, width, height);
      else {
        // Keep the torso intact; shear each lower leg from a fixed joint.
        const joint = 0.72,
          legHeight = height * (1 - joint),
          legs = [0, 0.18, 0.46, 0.64, 1];
        ctx.drawImage(
          pig,
          0,
          0,
          pig.width,
          pig.height * joint,
          -width / 2,
          top,
          width,
          height * joint,
        );
        for (let i = 0; i < legs.length - 1; i++) {
          const step = stride * (i === 0 || i === 3 ? 1 : -1),
            lift = Math.max(0, Math.cos(phase + (i === 0 || i === 3 ? 0 : Math.PI)));
          ctx.save();
          ctx.translate(-width / 2 + legs[i] * width, top + height * joint);
          ctx.transform(1, 0, (step * r * 0.18) / legHeight, 1 - lift * 0.25, 0, 0);
          ctx.drawImage(
            pig,
            legs[i] * pig.width,
            pig.height * joint,
            (legs[i + 1] - legs[i]) * pig.width,
            pig.height * (1 - joint),
            0,
            0,
            (legs[i + 1] - legs[i]) * width,
            legHeight,
          );
          ctx.restore();
        }
      }
      if (obj.taken) {
        ellipse(r * 0.55, -r * 0.25, 3, 3.5, "#fff1d1");
        ellipse(r * 0.6, -r * 0.25, 1.5, 2, "#35251c");
      }
      if (obj.type === "diamondPig") {
        const gem = assets.sprites.diamond;
        if (gem) ctx.drawImage(gem, r * 0.68, -1, r * 0.58, r * 0.49);
      }
      return;
    }
    const step = stride * 4;
    line(
      [
        [-13, 10],
        [-14 + step, 19],
      ],
      "#d68c7e",
      6,
    );
    line(
      [
        [9, 10],
        [10 - step, 19],
      ],
      "#d68c7e",
      6,
    );
    ellipse(-14 + step, 20, 4, 2.5, "#925b58");
    ellipse(10 - step, 20, 4, 2.5, "#925b58");
    ctx.beginPath();
    ctx.arc(-22, -4, 4, 0, Math.PI * 1.8);
    ctx.strokeStyle = "#e6a08c";
    ctx.lineWidth = 3;
    ctx.stroke();
    ellipse(-3, 1, 22, 17, obj.color);
    ellipse(-7, -5, 13, 7, "#bcaa88");
    ellipse(-2, 9, 13, 6, "#806957");
    ellipse(12, -2, 13, 13, obj.color);
    polygon(
      [
        [5, -11],
        [3, -22],
        [12, -18],
        [16, -11],
      ],
      "#f3b6a6",
      "#bd7b70",
    );
    polygon(
      [
        [7, -13],
        [6, -19],
        [12, -16],
      ],
      "#dc8d87",
    );
    ellipse(22, 1, 7, 5.5, "#bca183");
    ellipse(21, 1, 1.1, 1.7, "#a75e5b");
    ellipse(25, 1, 1.1, 1.7, "#a75e5b");
    ellipse(11, 3, 4, 2.5, "#a9826a");
    if (obj.taken) {
      ellipse(16, -6, 4, 5, visual.palettes[frame.view.artName].lamp);
      ellipse(17, -5, 2, 3, visual.palettes[frame.view.artName].outline);
    } else {
      ellipse(16, -6, 2.8, 3.3, "#352d29");
      ellipse(16.8, -7.2, 1, 1.2, "#fff8eb");
    }
    ctx.beginPath();
    ctx.arc(18, 5, 3, 0.15, Math.PI * 0.85);
    ctx.strokeStyle = "#a75e5b";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    if (obj.type === "diamondPig") {
      polygon(
        [
          [19, 5],
          [23, 0],
          [31, 0],
          [35, 5],
          [27, 15],
        ],
        "#adf4f0",
        "#4d8e85",
      );
      polygon(
        [
          [19, 5],
          [27, 5],
          [27, 15],
        ],
        "#62b9bd",
      );
      line(
        [
          [23, 0],
          [27, 5],
          [31, 0],
        ],
        "#efffff",
        1,
      );
      line(
        [
          [30, -10],
          [30, -2],
        ],
        "#efffff",
        2,
      );
      line(
        [
          [26, -6],
          [34, -6],
        ],
        "#efffff",
        2,
      );
    }
  }
  // Faceted diamond or gem.
  function drawGem(obj, paint) {
    const { r } = paint;
    polygon(
      [
        [-r, -r * 0.3],
        [-r * 0.5, -r],
        [r * 0.5, -r],
        [r, -r * 0.3],
        [0, r],
      ],
      obj.color,
      "#4d8e85",
      Math.max(2, FEEL.outlinePx / frame.view.cssScale()),
    );
    polygon(
      [
        [-r, -r * 0.3],
        [0, -r * 0.3],
        [-r * 0.5, -r],
      ],
      "#dcfff0",
    );
    polygon(
      [
        [0, -r * 0.3],
        [r, -r * 0.3],
        [0, r],
      ],
      "#5fa99b",
    );
    line(
      [
        [-r, -r * 0.3],
        [r, -r * 0.3],
      ],
      "#e2fff0",
      1,
    );
    line(
      [
        [0, -r],
        [0, -r * 0.3],
        [0, r],
      ],
      "#ddfff4",
      1,
    );
    ctx.fillStyle = "#e9fff3";
    ctx.fillRect(r + 5, -r - 4, 2, 9);
    ctx.fillRect(r + 2, -r - 1, 8, 2);
  }
  // TNT barrel with its lit fuse.
  function drawTnt(obj, paint) {
    const { r, now } = paint;
    const shade = ctx.createLinearGradient(-r * 0.7, 0, r * 0.7, 0);
    shade.addColorStop(0, "#762e27");
    shade.addColorStop(0.3, "#df7050");
    shade.addColorStop(0.65, obj.color);
    shade.addColorStop(1, "#682b26");
    ctx.beginPath();
    ctx.moveTo(-r * 0.58, -r * 0.65);
    ctx.bezierCurveTo(-r * 0.8, -r * 0.3, -r * 0.8, r * 0.35, -r * 0.58, r * 0.7);
    ctx.quadraticCurveTo(0, r * 0.95, r * 0.58, r * 0.7);
    ctx.bezierCurveTo(r * 0.8, r * 0.35, r * 0.8, -r * 0.3, r * 0.58, -r * 0.65);
    ctx.closePath();
    ctx.fillStyle = shade;
    ctx.fill();
    ctx.strokeStyle = "#432820";
    ctx.lineWidth = 2;
    ctx.stroke();
    line(
      [
        [-r * 0.3, -r * 0.6],
        [-r * 0.36, 0],
        [-r * 0.3, r * 0.72],
      ],
      "#7e352b",
      1,
    );
    line(
      [
        [r * 0.3, -r * 0.6],
        [r * 0.36, 0],
        [r * 0.3, r * 0.72],
      ],
      "#7e352b",
      1,
    );
    ellipse(0, -r * 0.65, r * 0.58, r * 0.2, "#ef9666");
    ellipse(0, -r * 0.65, r * 0.46, r * 0.12, "#a54c36");
    line(
      [
        [-r * 0.24, -r * 0.68],
        [r * 0.24, -r * 0.62],
      ],
      "#e88759",
      1,
    );
    line(
      [
        [-r * 0.66, -r * 0.4],
        [0, -r * 0.34],
        [r * 0.66, -r * 0.4],
      ],
      "#423e35",
      6,
    );
    line(
      [
        [-r * 0.66, -r * 0.43],
        [0, -r * 0.37],
        [r * 0.66, -r * 0.43],
      ],
      "#c6b88d",
      3,
    );
    line(
      [
        [-r * 0.66, r * 0.48],
        [0, r * 0.55],
        [r * 0.66, r * 0.48],
      ],
      "#423e35",
      6,
    );
    line(
      [
        [-r * 0.66, r * 0.45],
        [0, r * 0.52],
        [r * 0.66, r * 0.45],
      ],
      "#c6b88d",
      3,
    );
    ellipse(-r * 0.48, -r * 0.41, 1.3, 1.3, "#fff0c5");
    ellipse(r * 0.48, r * 0.49, 1.3, 1.3, "#fff0c5");
    ctx.fillStyle = "#b4a17a";
    ctx.fillRect(-r * 0.58, -r * 0.2, r * 1.16, r * 0.5);
    ctx.strokeStyle = "#71352a";
    ctx.lineWidth = 1;
    ctx.strokeRect(-r * 0.58, -r * 0.2, r * 1.16, r * 0.5);
    ctx.fillStyle = "#782d25";
    ctx.font = `900 12px "Departure Mono", monospace`;
    ctx.textAlign = "center";
    ctx.fillText("TNT", 0, r * 0.19);
    line(
      [
        [3, -r * 0.76],
        [7, -r],
        [13, -r * 0.95],
      ],
      "#665736",
      2,
    );
    const spark = 0.5 + Math.sin(now * 0.009 + obj.id) * 0.5;
    drawGlow(13, -r * 0.95, 2, now, { spread: 8, base: 0.2 + spark * 0.3 });
    ellipse(13, -r * 0.95, 1.2, 1.2, "#ffe1a0");
  }
  // Mystery bag.
  function drawBag() {
    polygon(
      [
        [-9, -18],
        [-13, -27],
        [0, -23],
        [12, -27],
        [8, -16],
      ],
      "#e0be8a",
    );
    ctx.beginPath();
    ctx.moveTo(-8, -15);
    ctx.bezierCurveTo(-31, 9, -24, 25, 0, 24);
    ctx.bezierCurveTo(26, 23, 29, 8, 8, -15);
    ctx.closePath();
    ctx.fillStyle = "#bc905e";
    ctx.fill();
    line(
      [
        [-10, -15],
        [11, -15],
      ],
      "#634c33",
      4,
    );
    ctx.fillStyle = "#f4d5a2";
    ctx.font = `bold 24px "Departure Mono", monospace`;
    ctx.textAlign = "center";
    ctx.fillText("?", 0, 14);
  }
  // Gold nuggets and rocks; the default painter.
  function drawOre(obj, paint) {
    const { r, daylight, now } = paint;
    const pts = obj.outline || [
      [-r, -r * 0.1],
      [-r * 0.7, -r * 0.7],
      [-r * 0.1, -r],
      [r * 0.7, -r * 0.6],
      [r, r * 0.2],
      [r * 0.4, r * 0.8],
      [-r * 0.5, r * 0.7],
    ];
    const rocky = obj.type === "rock";
    if (frame.view.art.flatOre) {
      const colors = visual.classic.ore;
      polygon(
        pts,
        rocky ? colors.rock : colors.gold,
        colors.outline,
        Math.max(1.8, FEEL.outlinePx / frame.view.cssScale()),
      );
      ctx.save();
      ctx.beginPath();
      pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      ctx.closePath();
      ctx.clip();
      polygon(
        [
          [-r, -r * 0.15],
          [-r * 0.5, -r * 0.8],
          [r * 0.25, -r * 0.65],
          [-r * 0.1, -r * 0.2],
        ],
        rocky ? colors.rockLight : colors.goldLight,
        null,
      );
      polygon(
        [
          [-r * 0.6, r * 0.4],
          [r * 0.3, r * 0.55],
          [r, r * 0.1],
          [r * 0.55, r * 0.9],
          [-r * 0.3, r * 0.8],
        ],
        rocky ? colors.rockShade : colors.goldShade,
        null,
      );
      if (rocky)
        for (const crack of (obj.cracks || []).slice(0, 2))
          line(crack, colors.rockShade, FEEL.outlinePx / frame.view.cssScale());
      ctx.restore();
      return;
    }
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
    const shade = ctx.createRadialGradient(-r * 0.35, -r * 0.5, r * 0.1, 0, 0, r * 1.55);
    if (rocky) {
      shade.addColorStop(0, daylight ? SKY.rock[0] : "#837b60");
      shade.addColorStop(0.5, daylight ? SKY.rock[1] : "#4d4b3b");
      shade.addColorStop(1, daylight ? SKY.rock[2] : "#1d2521");
    } else {
      [0, 0.2, 0.43, 0.6, 0.8, 1].forEach((at, i) =>
        shade.addColorStop(
          at,
          daylight
            ? SKY.gold[i]
            : ["#fff2b6", "#ecb644", "#966012", "#432807", "#b7791b", "#211406"][i],
        ),
      );
    }
    ctx.fillStyle = shade;
    ctx.fill();
    // Rim light: the lantern sits up-centre, so the upper-left edge catches a warm lip.
    const rim = ctx.createLinearGradient(-r * 0.9, -r * 0.9, r * 0.8, r * 0.8);
    if (rocky) {
      rim.addColorStop(0, "rgba(228,222,198,.75)");
      rim.addColorStop(0.45, "rgba(120,118,100,.25)");
      rim.addColorStop(1, "rgba(10,12,10,.8)");
    } else {
      rim.addColorStop(0, "rgba(255,244,200,.9)");
      rim.addColorStop(0.45, "rgba(200,130,40,.35)");
      rim.addColorStop(1, "rgba(40,20,0,.8)");
    }
    ctx.strokeStyle = rim;
    ctx.lineWidth = Math.max(1.8, FEEL.outlinePx / frame.view.cssScale());
    ctx.stroke();
    ctx.save();
    ctx.clip();
    if (rocky && obj.cracks) {
      // fissures so boulders read as stone, not grey gems
      ctx.strokeStyle = "rgba(0,0,0,.38)";
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";
      for (const crackPath of obj.cracks) {
        ctx.beginPath();
        crackPath.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.stroke();
        ctx.strokeStyle = "rgba(216,206,180,.14)";
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.strokeStyle = "rgba(0,0,0,.38)";
        ctx.lineWidth = 1.2;
      }
    }
    for (const ch of obj.chunks || []) {
      // crystalline facet planes
      ctx.beginPath();
      ch.pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      ctx.closePath();
      ctx.fillStyle = rocky
        ? ch.lit > 0.5
          ? "rgba(228,226,206,.16)"
          : "rgba(0,0,0,.2)"
        : ch.lit > 0.5
          ? "rgba(255,240,198,.2)"
          : "rgba(56,28,0,.2)";
      ctx.fill();
      ctx.strokeStyle = rocky ? "rgba(0,0,0,.22)" : "rgba(74,42,4,.24)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if (!rocky) {
      ctx.globalCompositeOperation = "lighter"; // specular hit where the lantern lands
      const spec = ctx.createRadialGradient(-r * 0.45, -r * 0.55, 0, -r * 0.45, -r * 0.55, r * 1.1);
      spec.addColorStop(0, "rgba(255,246,206,.4)");
      spec.addColorStop(0.4, "rgba(255,206,110,.12)");
      spec.addColorStop(1, "rgba(255,160,60,0)");
      ctx.fillStyle = spec;
      ctx.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
      ctx.globalCompositeOperation = "source-over";
      polygon(
        [
          [-r * 0.66, -r * 0.26],
          [-r * 0.5, -r * 0.62],
          [-r * 0.1, -r * 0.72],
          [-r * 0.14, -r * 0.3],
        ],
        "rgba(255,232,154,.3)",
      );
      polygon(
        [
          [r * 0.52, r * 0.08],
          [r * 0.78, r * 0.36],
          [r * 0.42, r * 0.68],
          [r * 0.28, r * 0.28],
        ],
        "rgba(245,172,59,.23)",
      );
      polygon(
        [
          [-r * 0.9, -r * 0.06],
          [-r * 0.7, -r * 0.5],
          [-r * 0.34, -r * 0.56],
          [-r * 0.44, -r * 0.2],
        ],
        "rgba(255,222,150,.3)",
      );
      // Twinkling star flares: facet glints that catch the lantern as the nugget sits.
      if (obj.glints) {
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        for (const g of obj.glints) {
          const tw = Math.max(0, Math.sin(now * 0.0021 + g.phase));
          const gs = g.s * (0.4 + tw * 0.6),
            a = tw * tw * 0.85;
          if (a < 0.04) continue;
          ctx.globalAlpha = a;
          ctx.strokeStyle = "#fff3c8";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(g.x - gs, g.y);
          ctx.lineTo(g.x + gs, g.y);
          ctx.moveTo(g.x, g.y - gs);
          ctx.lineTo(g.x, g.y + gs);
          ctx.stroke();
          ctx.lineWidth = 0.7;
          ctx.globalAlpha = a * 0.7;
          const dg = gs * 0.6;
          ctx.beginPath();
          ctx.moveTo(g.x - dg, g.y - dg);
          ctx.lineTo(g.x + dg, g.y + dg);
          ctx.moveTo(g.x - dg, g.y + dg);
          ctx.lineTo(g.x + dg, g.y - dg);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
    } else {
      polygon(
        [
          [-r * 0.8, -r * 0.2],
          [-r * 0.55, -r * 0.62],
          [0, -r * 0.8],
          [-r * 0.1, -r * 0.3],
        ],
        "rgba(216,214,192,.4)",
      );
    }
    if (daylight) ctx.globalAlpha *= SKY.surfaceOpacity;
    ctx.drawImage(frame.view.art.surface(obj.id, r, rocky), -r * 1.3, -r * 1.3, r * 2.6, r * 2.6);
    ctx.restore();
    polygon(
      [
        [-r * 0.62, r * 0.42],
        [-r * 0.2, r * 0.62],
        [r * 0.44, r * 0.5],
        [r * 0.1, r * 0.74],
        [-r * 0.5, r * 0.68],
      ],
      "rgba(0,0,0,.22)",
    );
  }
  const PAINTERS = { diamond: drawGem, gem: drawGem, tnt: drawTnt, bag: drawBag };
  function drawObject(obj, x = obj.x, y = obj.y) {
    obj = decorate(obj);
    const r = obj.radius,
      daylight = frame.view.art.lit === false,
      now = calm.matches ? 0 : clock.now();
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, objectAspect);
    ctx.rotate(obj.rotation);
    if (frame.view.artName !== "sky") ellipse(3, r * 0.7, r * 0.9, r * 0.35, "#171b183a");
    const paintedKind = ["rock", "diamond", "gem", "bag", "tnt"].includes(obj.type)
      ? obj.type
      : isGold(obj.type)
        ? "gold"
        : null;
    const painted = !frame.view.art.flatOre && assets?.sprites[paintedKind];
    const paint = { r, daylight, now };
    if (painted) {
      const size = (r * 2) / Math.max(painted.width, painted.height);
      ctx.drawImage(
        painted,
        (-painted.width * size) / 2,
        (-painted.height * size) / 2,
        painted.width * size,
        painted.height * size,
      );
      ctx.restore();
      return;
    }
    if (obj.speed) drawPig(obj, paint);
    else (PAINTERS[obj.type] ?? drawOre)(obj, paint);
    ctx.restore();
  }
  return {
    draw(obj, state, view, x = obj.x, y = obj.y) {
      frame = { state, view };
      drawObject(obj, x, y);
    },
  };
}
