import { RULES, LEVELS } from "../core/levels.js";
import { SKY } from "../art/constants.js";
import { expression as expressionFor } from "./effects.js";
import { hookPosition as position } from "./geometry.js";
export function createRig({
  ctx,
  assets,
  prospector,
  constants: visual,
  calm,
  clock,
  shapes,
  LAMP,
}) {
  const { polygon, ellipse, line, drawGlow, GLOW } = shapes,
    { origin, objectAspect } = RULES;
  // Set at the start of draw/geometry: { state, fx, view } for the frame being drawn.
  let frame;
  const expression = (now) => expressionFor(frame.state, frame.fx, now);
  function operatorPose(now) {
    const mood = expression(now);
    const rig = visual.rig;
    const operator = assets?.sprites[mood],
      shoulder = { x: 488, y: 92 };
    // The short ratchet stroke leans the operator above boots planted on the catwalk.
    const stroke = calm.matches ? 0 : Math.sin(frame.fx.crankAngle) * rig.ratchetPx;
    const operatorHeight = visual.authored.operatorHeight - (operator ? stroke : 0);
    const operatorX = rig.operatorX + stroke * 0.2,
      operatorY = origin.y - operatorHeight;
    const handleX = operator
      ? operatorX + ((rig.gloveU - 0.5) * operatorHeight * operator.width) / operator.height
      : rig.fallbackGrip.x + stroke * 0.2;
    const handleY = operator
      ? operatorY + rig.gloveV * operatorHeight
      : rig.fallbackGrip.y + stroke;

    return { mood, operator, shoulder, operatorHeight, operatorX, operatorY, handleX, handleY };
  }
  // Timber and railwork over the catwalk opening.
  function drawCatwalk() {
    // Dimensional timber and railwork ground the live rig in every backdrop.
    const timber = ctx.createLinearGradient(0, 130, 0, 154);
    timber.addColorStop(0, "#b58646");
    timber.addColorStop(0.18, "#6f4927");
    timber.addColorStop(1, "#21170f");
    // A real opening in the catwalk lets the cable leave its fixed swing pivot.
    polygon(
      [
        [385, origin.y],
        [528, origin.y],
        [528, 151],
        [572, 151],
        [572, origin.y],
        [810, origin.y],
        [798, 151],
        [396, 151],
      ],
      timber,
      "#1a160e",
      1,
    );
    line(
      [
        [385, origin.y],
        [528, origin.y],
      ],
      "#d7ab67",
      2,
    );
    line(
      [
        [572, origin.y],
        [810, origin.y],
      ],
      "#d7ab67",
      2,
    );
    for (let x = 398; x < 800; x += 24) {
      if (x + 17 > 528 && x < 572) continue;
      line(
        [
          [x, 137],
          [x + 17, 137],
        ],
        "#c7955344",
        0.7,
      );
      ellipse(x, 144, 1.5, 1.5, "#191a15");
    }
  }
  // Lantern-lit braces and posts under the catwalk.
  function drawSupports(scene) {
    const { daylight } = scene;
    if (!daylight) {
      for (const x of [401, 793]) {
        line(
          [
            [x, -20],
            [x, 133],
          ],
          "#1d1911",
          7,
        );
        line(
          [
            [x - 2, -20],
            [x - 2, origin.y],
          ],
          "#ae854748",
          1,
        );
        line(
          [
            [x, 149],
            [x + 10, 218],
          ],
          "#2f2117",
          12,
        );
        line(
          [
            [x - 3, 152],
            [x + 6, 214],
          ],
          "#84613c55",
          2,
        );
      }
      line(
        [
          [401, 19],
          [793, 19],
        ],
        "#392719",
        13,
      );
      line(
        [
          [401, 16],
          [793, 16],
        ],
        "#af82494d",
        2,
      );
      line(
        [
          [401, 20],
          [438, 59],
        ],
        "#6b4e2a",
        8,
      );
      line(
        [
          [793, 20],
          [754, 59],
        ],
        "#6b4e2a",
        8,
      );
    }
  }
  // Winch: the painted sprite, or the procedural frame and drum.
  function drawWinch(scene) {
    const { paintedWinch } = scene;
    if (paintedWinch) ctx.drawImage(paintedWinch, 500, 58, 101, 76);
    else {
      ctx.fillStyle = "#3a2a17";
      ctx.save();
      ctx.translate(520, origin.y);
      ctx.rotate(-0.19);
      ctx.fillRect(-7, -50, 14, 52);
      ctx.fillStyle = "rgba(214,166,96,.3)";
      ctx.fillRect(-7, -50, 3, 52);
      ctx.restore();
      ctx.fillStyle = "#3a2a17";
      ctx.save();
      ctx.translate(580, origin.y);
      ctx.rotate(0.19);
      ctx.fillRect(-7, -50, 14, 52);
      ctx.fillStyle = "rgba(214,166,96,.22)";
      ctx.fillRect(4, -50, 3, 52);
      ctx.restore();
      ctx.fillStyle = "#4a361e";
      ctx.fillRect(505, 80, 90, 11);
      ctx.fillStyle = "rgba(224,176,104,.34)";
      ctx.fillRect(505, 80, 90, 2.5);
      line(
        [
          [520, 96],
          [580, 96],
        ],
        "#33260f",
        4,
      );
      ellipse(550, 106, 20, 20, "#1f1a13");
      ellipse(550, 106, 16, 16, "#5c4e39");
      ellipse(550, 106, 7, 7, "#14110d");
    }
  }
  // Meshed reduction gears and axles (procedural winch only), then the crank bearing.
  function drawGears(scene) {
    const { paintedWinch } = scene;
    const rig = visual.rig,
      { drum, crank, drive } = rig;
    // Meshed reduction gears and solid axles replace unsupported diagonal drive lines.
    if (!paintedWinch) {
      line(
        [
          [crank.x, crank.y],
          [drive.x, drive.y],
          [drum.x, drum.y],
        ],
        "#211c16",
        5,
      );
      line(
        [
          [crank.x, crank.y],
          [drive.x, drive.y],
          [drum.x, drum.y],
        ],
        "#897252",
        1.5,
      );
      drawGear(
        drive.x,
        drive.y,
        drive.radius,
        (-frame.fx.crankAngle * crank.radius) / drive.radius,
        rig.iron,
      );
      drawGear(crank.x, crank.y, crank.radius, frame.fx.crankAngle, rig.brass);
      // A bearing clamps the crank spindle to the actual timber frame.
      polygon(
        [
          [crank.x - 5, crank.y - 8],
          [crank.x + 6, crank.y - 8],
          [crank.x + 6, crank.y + 8],
          [crank.x - 5, crank.y + 8],
        ],
        "#493d2e",
        "#191711",
        1,
      );
      for (const y of [crank.y - 6, crank.y + 6]) ellipse(crank.x + 3, y, 1, 1, "#b49b6c");
    }
    ellipse(crank.x, crank.y, 3, 4, "#342b20");
    ellipse(crank.x, crank.y, 1.8, 2.7, "#bb9859");
  }
  // Forged crank arm and the handle the operator grips.
  function drawCrankHandle(scene) {
    const { handleX, handleY } = scene.pose;
    const rig = visual.rig,
      { crank } = rig;
    const crankPath = [
      [crank.x, crank.y],
      [handleX + 9, crank.y],
      [handleX + 9, handleY],
      [handleX, handleY],
    ];
    const forged = ctx.createLinearGradient(handleX + 7, 0, handleX + 11, 0);
    forged.addColorStop(0, rig.iron[2]);
    forged.addColorStop(0.45, rig.iron[0]);
    forged.addColorStop(1, rig.iron[1]);
    ctx.save();
    ctx.lineCap = ctx.lineJoin = "round";
    line(crankPath, "#211b15", 5);
    line(crankPath, forged, 3.2);
    line(
      crankPath.map(([x, y]) => [x - 0.5, y - 0.5]),
      "#e4cda477",
      0.7,
    );
    // Both painted gloves close over the same short handle; the grip is drawn behind them.
    line(
      [
        [handleX - 17, handleY],
        [handleX + 7, handleY],
      ],
      "#30261b",
      3.5,
    );
    line(
      [
        [handleX - 17, handleY - 1],
        [handleX + 7, handleY - 1],
      ],
      "#b49a70",
      0.8,
    );
    ellipse(handleX, handleY, 4.5, 4.5, "#5e432a");
    ctx.restore();
  }
  // Feed cable and fairlead from the drum through the catwalk opening.
  function drawFeedCable() {
    const rig = visual.rig,
      { drum } = rig;
    // Feed cable and a steel fairlead continue the drum through the catwalk opening.
    drawChain({ x: drum.x, y: drum.y + 3 }, origin, 0, 0);
    line(
      [
        [538, 128],
        [538, 122],
        [562, 122],
        [562, 128],
      ],
      "#5c5544",
      3,
    );
    ellipse(origin.x, origin.y - 3, 6, 6, "#25251f");
    ellipse(origin.x, origin.y - 3, 4, 4, "#938a70");
    ellipse(origin.x, origin.y, 2, 2, "#25251f");
  }
  // Ore cart, heaped with the actual haul.
  function drawCart(scene) {
    const { flicker, paintedCart } = scene;
    // Ore cart: rusted steel hopper on iron wheels, heaped past the rim.
    if (paintedCart) ctx.drawImage(paintedCart, 646, 92, 134, 53);
    else {
      const cart = () => {
        ctx.beginPath();
        ctx.moveTo(646, 94);
        ctx.lineTo(780, 94);
        ctx.lineTo(764, origin.y);
        ctx.lineTo(662, origin.y);
        ctx.closePath();
      };
      cart();
      const steel = ctx.createLinearGradient(646, 94, 780, origin.y);
      steel.addColorStop(0, "#c49a58");
      steel.addColorStop(0.12, "#655442");
      steel.addColorStop(0.38, "#333532");
      steel.addColorStop(0.52, "#777062");
      steel.addColorStop(0.56, "#3b3932");
      steel.addColorStop(0.85, "#24231f");
      steel.addColorStop(1, "#0c1010");
      ctx.fillStyle = steel;
      ctx.fill();
      ctx.strokeStyle = "#6f5f4a";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      cart();
      ctx.clip();
      ctx.fillStyle = "rgba(0,0,0,.6)";
      ctx.fillRect(646, 120, 134, 14);
      line(
        [
          [646, 95],
          [780, 95],
        ],
        "#edc47b",
        1,
      );
      line(
        [
          [650, 98],
          [777, 98],
        ],
        "#171914",
        2,
      );
      ctx.globalAlpha = 0.4;
      ctx.drawImage(frame.view.art.surface(404, 60, true), 646, 94, 134, 40);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    // Gold heaped over the rim, irregular as it was shovelled in.
    const jitter = (n) => {
      const v = Math.sin(n * 12.9898) * 43758.5453;
      return v - Math.floor(v);
    };
    const loadedPieces = Math.ceil(
      Math.min(1, frame.state.haul / LEVELS[frame.state.level].target) * visual.cartPieces,
    );
    for (let i = 0; i < loadedPieces; i++) {
      const gx = 648 + i * 10.5 + jitter(i) * 7,
        gy = 92 - Math.sin(i * 0.9) * 6 - jitter(i + 7) * 8;
      const s = 0.8 + jitter(i + 3) * 0.55;
      polygon(
        [
          [gx - 8 * s, gy + 5 * s],
          [gx - 6 * s, gy - 5 * s],
          [gx + 2 * s, gy - 9 * s],
          [gx + 8 * s, gy - 1 * s],
          [gx + 4 * s, gy + 6 * s],
        ],
        "#987022",
        "#4e3516",
      );
      polygon(
        [
          [gx - 6 * s, gy - 5 * s],
          [gx + 2 * s, gy - 9 * s],
          [gx + 1 * s, gy - 2 * s],
          [gx - 3 * s, gy + 1 * s],
        ],
        "#dbb662",
      );
    }
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.22 * flicker;
    ctx.drawImage(GLOW, 662, 46, 130, 110);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    if (!paintedCart) {
      for (const wx of [666, 758]) {
        ellipse(wx, 133, 12, 12, "#0f0d0b");
        ellipse(wx, 133, 7, 7, "#3a3128");
        ellipse(wx - 2, 130, 2.2, 2.2, "#9c8867");
      }
      // Riveted reinforcing straps and scored steel panels on the cart.
      for (const x of [669, 707, 751]) {
        line(
          [
            [x, 98],
            [x + (713 - x) * 0.12, 126],
          ],
          "#89704766",
          3,
        );
        for (const y of [101, 123]) {
          ellipse(x, y, 1.7, 1.7, "#0b100e");
          ellipse(x - 0.4, y - 0.5, 0.65, 0.65, "#b99b62");
        }
      }
      for (let i = 0; i < 15; i++)
        line(
          [
            [659 + i * 7, 108 + (i % 4)],
            [669 + i * 7, 107 + (i % 4)],
          ],
          "#b6975522",
          0.6,
        );
    }
  }
  // Lantern post and the single light of the mine.
  function drawLantern(scene) {
    const { flicker } = scene;
    // Lantern post and the single light of the mine.
    line(
      [
        [622, 94],
        [622, 80],
      ],
      "#241d15",
      4,
    );
    line(
      [
        [613, 76],
        [631, 76],
      ],
      "#241d15",
      3,
    );
    ellipse(LAMP.x, LAMP.y, 12, 14, "#1c1610");
    ellipse(LAMP.x, LAMP.y, 9, 11, "rgba(255,190,96," + 0.9 * flicker + ")");
    ellipse(LAMP.x, LAMP.y + 2, 4.5, 5.5, "rgba(255,246,214," + flicker + ")");
    ellipse(LAMP.x, LAMP.y - 14, 7, 3, "#544527");
    ellipse(LAMP.x, LAMP.y + 12, 8, 3, "#55401e");
    for (const x of [LAMP.x - 7, LAMP.x + 7])
      line(
        [
          [x, LAMP.y - 10],
          [x, LAMP.y + 11],
        ],
        "#3a321d",
        1.7,
      );
    ctx.beginPath();
    ctx.arc(LAMP.x, LAMP.y - 16, 5, Math.PI, 0);
    ctx.strokeStyle = "#96723a";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    line(
      [
        [LAMP.x - 5, LAMP.y - 8],
        [LAMP.x - 5, LAMP.y + 7],
      ],
      "#fff2b8",
      1,
    );
    line(
      [
        [LAMP.x - 8, LAMP.y + 12],
        [LAMP.x + 8, LAMP.y + 12],
      ],
      "#d2a44c",
      1,
    );
  }
  // Operator: authored art, or the procedural fallback.
  function drawOperator(scene) {
    const { daylight, flicker } = scene;
    const { mood, operator, shoulder, operatorHeight, operatorX, operatorY, handleX, handleY } =
      scene.pose;
    const rig = visual.rig;
    if (operator) {
      ellipse(rig.operatorX, origin.y, 28, 4, "#0005");
      // Keep the complete authored silhouette, including both naturally bent arms and gloves.
      prospector.draw(ctx, operatorX, operatorY, operatorHeight, mood, frame.view.artName);
      return;
    }
    // Procedural operator fallback if local images cannot be decoded.
    const [elbowX, elbowY, handX, handY] = reach(
      shoulder.x,
      shoulder.y,
      handleX,
      handleY,
      rig.upperArm,
      rig.forearm,
    );
    ctx.save();
    ctx.fillStyle = "#05060a";
    ctx.strokeStyle = "#05060a";
    ctx.lineCap = "round";
    ctx.lineWidth = 9; // far arm
    ctx.beginPath();
    ctx.moveTo(480, 88);
    ctx.lineTo(468, 112);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(shoulder.x, shoulder.y);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke(); // near arm on the crank
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(452, 110);
    ctx.lineTo(446, 134);
    ctx.lineTo(460, 134);
    ctx.lineTo(468, 112);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(470, 112);
    ctx.lineTo(474, 134);
    ctx.lineTo(488, 134);
    ctx.lineTo(490, 110);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(444, 86);
    ctx.quadraticCurveTo(468, 78, 494, 88);
    ctx.lineTo(488, 114);
    ctx.quadraticCurveTo(468, 120, 450, 112);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(469, 70, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(452, 68);
    ctx.quadraticCurveTo(469, 51, 487, 68);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(450, 66, 39, 3.6);
    ctx.fillStyle = "rgba(255,238,196," + (0.5 + flicker * 0.4) + ")"; // cap lamp
    ctx.beginPath();
    ctx.arc(479, 62, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,188,106,.5)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(486, 68);
    ctx.quadraticCurveTo(480, 70, 480, 74);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(494, 88);
    ctx.lineTo(488, 114);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(490, 110);
    ctx.lineTo(488, 134);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(460, 134);
    ctx.lineTo(467, 112);
    ctx.stroke();
    const coat = ctx.createLinearGradient(451, 85, 492, 112);
    coat.addColorStop(0, daylight ? SKY.coat[0] : "#121a19");
    coat.addColorStop(1, daylight ? SKY.coat[1] : "#484230");
    polygon(
      [
        [451, 88],
        [471, 84],
        [488, 90],
        [485, 111],
        [456, 111],
      ],
      coat,
    );
    line(
      [
        [465, 88],
        [463, 109],
      ],
      "#887343",
      2,
    );
    line(
      [
        [482, 89],
        [479, 109],
      ],
      "#887343",
      2,
    );
    polygon(
      [
        [471, 72],
        [481, 70],
        [481, 79],
        [475, 84],
        [469, 78],
      ],
      daylight ? SKY.skin : "#8f734b",
    );
    polygon(
      [
        [469, 76],
        [481, 76],
        [478, 85],
        [472, 83],
      ],
      daylight ? SKY.beard : "#a49b7b",
    );
    line(
      [
        [shoulder.x, shoulder.y],
        [elbowX, elbowY],
        [handX, handY],
      ],
      daylight ? SKY.coat[0] : "#514c37",
      7,
    );
    ellipse(handX, handY, 4, 3, daylight ? SKY.skin : "#a38a58");
    line(
      [
        [453, 115],
        [450, 130],
      ],
      "#25312c",
      8,
    );
    line(
      [
        [476, 115],
        [480, 130],
      ],
      "#30382e",
      8,
    );
    line(
      [
        [449, 133],
        [459, 133],
      ],
      "#121512",
      4,
    );
    line(
      [
        [478, 133],
        [490, 133],
      ],
      "#121512",
      4,
    );
    prospector.head(ctx, 469, 66, visual.headRadius, expression(clock.now()), frame.view.artName);
    ctx.restore();
  }
  function drawRig(now) {
    const daylight = frame.view.art.lit === false;
    if (calm.matches) now = 0;
    const flicker =
      0.82 +
      Math.sin(now * 0.013) * 0.06 +
      Math.sin(now * 0.041) * 0.05 +
      Math.sin(now * 0.0073) * 0.05;
    const scene = {
      daylight,
      now,
      flicker,
      paintedWinch: assets?.sprites.winch,
      paintedCart: assets?.sprites.cart,
      pose: operatorPose(clock.now()),
    };
    drawCatwalk(scene);
    drawSupports(scene);
    drawWinch(scene);
    drawGears(scene);
    drawCrankHandle(scene);
    drawFeedCable(scene);
    drawCart(scene);
    drawLantern(scene);
    drawOperator(scene);
    return flicker;
  }
  function drawGear(x, y, r, rotation, colors) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.4, 1);
    ctx.rotate(rotation);
    const metal = ctx.createLinearGradient(-r, -r, r, r);
    metal.addColorStop(0, colors[0]);
    metal.addColorStop(0.45, colors[1]);
    metal.addColorStop(1, colors[2]);
    const teeth = [];
    for (let i = 0; i < 64; i++) {
      const a = (i * Math.PI) / 32,
        radius = r + (i % 4 < 2 ? 1.4 : -0.8);
      teeth.push([Math.cos(a) * radius, Math.sin(a) * radius]);
    }
    polygon(teeth, metal, "#211c16", 1);
    ellipse(0, 0, r * 0.73, r * 0.73, colors[2], colors[0], 0.6);
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      ellipse(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, 2, 2, "#1c1b16", colors[1], 0.5);
    }
    ellipse(0, 0, 3, 3, colors[0], "#262019", 1);
    ctx.restore();
  }
  function reach(sx, sy, tx, ty, upper, fore) {
    const d = Math.max(1, Math.min(upper + fore - 0.01, Math.hypot(tx - sx, ty - sy))),
      base = Math.atan2(ty - sy, tx - sx);
    const bend = Math.acos(
      Math.max(-1, Math.min(1, (upper * upper + d * d - fore * fore) / (2 * upper * d))),
    );
    return [
      sx + Math.cos(base + bend) * upper,
      sy + Math.sin(base + bend) * upper,
      sx + Math.cos(base) * d,
      sy + Math.sin(base) * d,
    ];
  }
  function drawChain(from, to, tension, now) {
    const dx = to.x - from.x,
      dy = to.y - from.y,
      dist = Math.max(1, Math.hypot(dx, dy));
    const bow = Math.min(dist * 0.035, tension) * (1 + Math.sin(now * 0.012) * 0.18);
    ctx.save();
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(
      (from.x + to.x) / 2 - (dy / dist) * bow,
      (from.y + to.y) / 2 + (dx / dist) * bow,
      to.x,
      to.y,
    );
    ctx.strokeStyle = "#171914";
    ctx.lineWidth = visual.rig.cableWidth + 1.8;
    ctx.stroke();
    ctx.strokeStyle = "#a49a7f";
    ctx.lineWidth = visual.rig.cableWidth;
    ctx.stroke();
    ctx.strokeStyle = "#eee0bb";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  }
  function drawClaw(p, now) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(1, objectAspect);
    ctx.rotate(-frame.state.angle);
    if (frame.state.magnetArmed) drawGlow(0, 0, 16, now, { spread: 5, base: 0.25 });
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.24;
    ctx.drawImage(GLOW, -50, -50, 100, 100);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    for (const spread of [-1.2, -0.44, 0.44, 1.2]) {
      const a = spread * (frame.state.caught ? 0.48 : 1); // four open prongs
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(-3.4, -3);
      ctx.quadraticCurveTo(-10, 9, -4.4, 20);
      ctx.quadraticCurveTo(-0.4, 23.5, 2.6, 19.5);
      ctx.quadraticCurveTo(0.6, 9, 3.4, -2);
      ctx.closePath();
      const jaw = ctx.createLinearGradient(-4, -3, 3, 21);
      jaw.addColorStop(0, "#9c9686");
      jaw.addColorStop(0.42, "#5b564d");
      jaw.addColorStop(1, "#232019");
      ctx.fillStyle = jaw;
      ctx.fill();
      ctx.strokeStyle = "#12100d";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2.6, 1);
      ctx.quadraticCurveTo(-6.4, 10, -2.6, 18.5);
      ctx.strokeStyle = "rgba(232,222,196,.72)";
      ctx.lineWidth = Math.max(1.7, visual.clawOutlinePx / frame.view.cssScale());
      ctx.stroke();
      ctx.restore();
    }
    ellipse(0, -2, 9.5, 8, "#2b271f");
    ellipse(0, -2, 7.5, 6, "#6b6555");
    ellipse(-1.6, -3.4, 3.4, 2.4, "#b8b096");
    ctx.fillStyle = "#3a352c";
    ctx.fillRect(-2, -12, 4, 7);
    ctx.beginPath();
    ctx.arc(0, visual.rig.eyeY, visual.rig.eyeRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "#6b6555";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
  return {
    draw(current, now) {
      frame = current;
      return drawRig(now);
    },
    chain: drawChain,
    claw: drawClaw,
    geometry(current, now) {
      frame = current;
      const p = position(current.state),
        eyeTop = visual.rig.eyeY - visual.rig.eyeRadius,
        eye = {
          x: p.x + Math.sin(frame.state.angle) * eyeTop,
          y: p.y + Math.cos(frame.state.angle) * eyeTop * objectAspect,
        },
        pose = operatorPose(now),
        hand = reach(
          pose.shoulder.x,
          pose.shoulder.y,
          pose.handleX,
          pose.handleY,
          visual.rig.upperArm,
          visual.rig.forearm,
        );
      return {
        cable: { from: origin, to: eye },
        eye,
        handle: { x: pose.handleX, y: pose.handleY },
        grip: pose.operator ? { x: pose.handleX, y: pose.handleY } : { x: hand[2], y: hand[3] },
        operator: pose.operator
          ? {
              image: pose.operator,
              x: pose.operatorX,
              y: pose.operatorY,
              height: pose.operatorHeight,
            }
          : null,
        operatorFeet: pose.operator ? origin.y : null,
      };
    },
  };
}
