'use strict';
// Visual-only tuning. Physics, prices, generation and save data remain in game.js.
window.VisualConstants = Object.freeze({
  authored: { horizon: { classic: .195, sky: .245 }, operatorHeight: 116, motes: 16, drift: 5, moteAlpha: .2, motePx: 1.2, vignetteAlpha: .25 },
  rig: {
    drum: { x: 550, y: 106 }, crank: { x: 516, y: 99, radius: 12 }, drive: { x: 539, y: 106, radius: 15 },
    operatorX: 469, gloveU: .905, gloveV: .424, ratchetPx: 1.2, fallbackGrip: { x: 507, y: 88 }, upperArm: 16, forearm: 12,
    eyeY: -13, eyeRadius: 3, cableWidth: 2.2,
    iron: ['#b2a58c', '#62594b', '#26241f'], brass: ['#d9b86f', '#8c6638', '#49311d']
  },
  safeTopRatio: .08, transitionMs: 220, expressionMs: 1500, entranceMs: 900,
  pulseMs: 650, ringMs: 750, maxRings: 6, trailMs: 260, maxTrail: 9,
  trailIntervalMs: 30, minParticlePx: 2.5, clawOutlinePx: 1.2,
  rewardFontPx: 28, portraitHeightRatio: .3, portraitMinPx: 84, portraitMaxPx: 270,
  portraitGapPx: 10, portraitWidthRatio: .84, portraitFitRatio: .2, headRadius: 21, cartPieces: 13,
  ambientMotes: 12, ambientMotePx: 1.8, ambientDrift: 7, ambientMoteAlpha: .25, ambientMotePulse: .15,
  portraitUiHeightPx: 116,
  portraitCaptionHeightPx: 26, portraitCaptionPaddingPx: 12, portraitCaptionRadiusPx: 9, portraitCaptionLinePx: 1.5,
  ringAlpha: .75, pulseAlpha: .1, trailAlpha: .45, portraitBobPx: 3,
  classic: {
    width: 1100, height: 580, ground: 142, seed: 1983, grainCount: 420, pebbleCount: 30, bannerTint: '68,45,23',
    cloudCount: 4, cloudSpeed: 7, cloudCycle: 1360, cloudSpacing: 290, cloudSize: 56,
    sky: '#86cbdc', skyHaze: '#edf3d7', cloud: '#fff9e9', cloudShade: '#c7e0df',
    hills: ['#9bb78c', '#779867', '#547c49'], turf: '#708c38', turfLight: '#c2d681',
    soil: ['#c3975b', '#af8048', '#906238'], soilEdge: '#634322', grain: '#704b2e40', pebble: '#89603c',
    sunX: 940, sunY: 36, sunRadius: 24, sun: '#fff0b0', sunHalo: '#fff5c355',
    seamSpacing: 88, seamWave: 7, seamLight: '#edc58435', seamShade: '#71492524',
    plantSpacing: 64, plant: '#5a7845', plantLight: '#95af65', edgeShade: '#50311938',
    ore: { gold: '#f5c432', goldLight: '#ffe991', goldShade: '#ba801b', rock: '#91978b', rockLight: '#cbd0b9', rockShade: '#697061', outline: '#503919' },
    uiPaper: '#f8e9bd', uiLine: '#614525'
  },
  sky: {
    mineX: 196, mineWidth: 76, mineRoof: '#806043', mineShade: '#3e4933', mineWall: '#c5ab7c',
    fence: '#9b7647', fenceHighlight: '#f0d6a0', fenceSpacing: 36,
    zenith: '#368ecd', haze: '#fff2d1', ridgeMist: '#fff3d855'
  },
  cavern: {
    seamCount: 7, seamColor: '#75b8ae28', seamShadow: '#001a1b55',
    mineral: '#466e67', mineralLight: '#b0d0ad', mineralShade: '#182e2b',
    mineralPositions: [[80,340,32],[990,420,42],[1025,250,24],[52,205,18]],
    poolX: 875, poolY: 544, poolWidth: 115, poolColor: '#77bcb02b', poolLight: '#c4ddbc55'
  },
  palettes: {
    classic: { outline: '#503919', skin: '#e9bb82', cheek: '#cf8263', beard: '#e6dfc4', coat: '#598259', coatShade: '#304d39', helmet: '#dca22f', helmetLight: '#ffe991', lamp: '#fff7d9', steel: '#b9c7bd', gold: '#f5c432', gem: '#a8f1ee', glow: '255,218,118', badge: '#614525' },
    cavern: { outline: '#201c17', skin: '#e8b77c', cheek: '#c97858', beard: '#ead8af', coat: '#3e6255', coatShade: '#233d35', helmet: '#c99736', helmetLight: '#ffdb7b', lamp: '#fff4c1', steel: '#b9c8c0', gold: '#ffdb7b', gem: '#aaf5ed', glow: '255,205,116', badge: '#101d19' },
    sky: { outline: '#503318', skin: '#f5c891', cheek: '#de926d', beard: '#fff0d1', coat: '#598259', coatShade: '#304d39', helmet: '#e3a52e', helmetLight: '#ffe697', lamp: '#fff9db', steel: '#d5dfcc', gold: '#ffe697', gem: '#adf7f0', glow: '255,226,155', badge: '#4b3116' }
  },
  captions: { normal: 'READY TO REEL', pulling: 'HEAVE HO!', surprised: 'WHOA THERE!', happy: 'PAYDIRT!', worried: 'ONE MORE TRY' }
});
