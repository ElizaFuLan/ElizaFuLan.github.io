/* Pixel Mikus: three hand-authored 32x42 sprites who float along the bottom
   of the window, and land on the footer rule when the page reaches it.

     classic   the avatar's Miku: flower in her hair, sings notes
     snow      Snow Miku: silver-blue hair, earmuffs and a snowflake scarf;
               flakes drift down around her and she throws them when she jumps
     rabbit    Rabbit Hole Miku, after the reference illustration: periwinkle
               hair, sheer lavender bunny ears, crimson bow tie, black bunny
               suit with an open heart, fishnets; she hops instead of walking
               and her song is hearts and playing cards

   Hair is simulated, not drawn: each twin tail is a wave travelling from root
   to tip, the two tails out of phase; it trails behind a walk, drags on the
   way up a jump and flares on the way down, and keeps swinging for a moment
   after she stops.

   Together they wander without overlapping; bring the pointer near and they
   gather round it; hover one and she waves; click one (or press Enter) and
   she jumps and sings while the other two hop along. A small switch tucks
   them away and remembers it.

   Decorative and additive: without JS nothing is drawn; with reduced motion
   they stand still and only change expression when pressed. */
(function () {
  "use strict";

  var host = document.querySelector("[data-miku]");
  var probe = document.createElement("canvas");
  if (!host || !probe.getContext) { return; }

  var W = 32;
  var H = 42;
  var TOP = 8; /* headroom above the head, for bunny ears */

  function merge(a, b) {
    var o = {}, k;
    for (k in a) { if (a.hasOwnProperty(k)) { o[k] = a[k]; } }
    for (k in b) { if (b.hasOwnProperty(k)) { o[k] = b[k]; } }
    return o;
  }

  var PAL = {
    o: "#1d2a33",                              /* outline */
    H: "#39c5bb", h: "#23958f", L: "#a6f0e7",  /* hair */
    S: "#ffe6d6", s: "#f1bda6",                /* skin */
    E: "#1aa7b3", e: "#0c4652", W: "#ffffff",  /* eyes */
    B: "#f7a3ab", M: "#c7505c", p: "#ee7f95",  /* blush, mouth, tongue */
    G: "#b9c2c7", g: "#8a959b",                /* top */
    K: "#2a2f39", k: "#474f5c",                /* skirt, sleeves, boots */
    P: "#f28da2", R: "#e0607e", V: "#a98de4", Y: "#ffe08a", /* flowers */
    w: "#f4f7f8"                               /* gloves */
  };

  /* ------------------------------------------------------------ parts --- */

  function part(x, y, rows) { return { x: x, y: y, rows: rows }; }

  function widthOf(p) {
    var w = 0;
    p.rows.forEach(function (r) { w = Math.max(w, r.length); });
    return w;
  }

  function mirror(p) {
    var width = widthOf(p);
    return part(W - p.x - width, p.y, p.rows.map(function (r) {
      while (r.length < width) { r += "."; }
      return r.split("").reverse().join("");
    }));
  }

  /* Shift the top `n` rows sideways: bends a raised arm, tilts an ear */
  function bend(p, n, dx) {
    return part(p.x, p.y, p.rows.map(function (r, i) {
      if (i >= n) { return r; }
      return dx > 0 ? new Array(dx + 1).join(".") + r : r.slice(-dx) + new Array(-dx + 1).join(".");
    }));
  }

  function recolor(p, map) {
    return part(p.x, p.y, p.rows.map(function (r) {
      return r.replace(/./g, function (ch) { return map[ch] || ch; });
    }));
  }

  function pair(p) { return [p, mirror(p)]; }

  var HEAD = part(7, 0, [
    ".....oooooooo.....",
    "...ooHHHHHHHHoo...",
    "..oHHHHHHHHHHHHo..",
    ".oHHHLLHHHHHHHHHo.",
    ".oHHLLHHHHHHHHHHo.",
    "oHHHHHHHHHHHHHHHHo",
    "oHHHHHHHHHHHHHHHHo",
    "oHHHhHHHHHHHHhHHHo",
    "oHHhShHhSShHhShHHo",
    "oHhSSSSSSSSSSSShHo",
    "oHhSeeSSSSSSeeShHo",
    "oHhSEWSSSSSSEWShHo",
    "oHhSEESSSSSSEEShHo",
    "oHhSBBSSMMSSBBShHo",
    "oHhoosSSSSSSsoohHo",
    "oHh.ooooooooo.hHo."
  ]);

  /* Expressions, laid over head rows 10-14 ('.' leaves the head alone) */
  var FACE = {
    open: null,
    blink: [
      "....SS......SS....",
      "....ee......ee....",
      "....SS......SS...."
    ],
    happy: [
      "....SS......SS....",
      "...SeS......SeS...",
      "...eSe......eSe...",
      "..................",
      "........pp........"
    ]
  };

  var LOCK_L = part(7, 16, ["oHh", "oHo", ".o."]);
  var LOCK_R = mirror(LOCK_L);

  var TIE_L = part(5, 5, ["oo", "RP", "oo"]);

  var TORSO = part(9, 16, [
    ".....oSSo.....",
    "...oGGHHGGo...",
    "...oGGhHGGo...",
    "...oGGhHGGo...",
    "...oGGhHGGo...",
    "...ogGhHGgo...",
    "...oggGGggo...",
    "...ooKKKKoo...",
    "..oKKkKKkKKo..",
    ".oKKkKKKKkKKo.",
    ".oHHHHHHHHHHo.",
    "..oooooooooo.."
  ]);

  var ARM_DOWN_L = part(10, 17, [".o", "oS", "oS", "oK", "oK", "oK", "ow", ".o"]);

  var ARM_UP_L = part(3, 10, [
    ".oo......",
    "owwo.....",
    "owwo.....",
    ".oKKo....",
    "..oKKo...",
    "...oKKo..",
    "....oSSo.",
    ".....oSSo",
    "......oSS",
    ".......oo"
  ]);

  var LEG_L = part(11, 28, [".oSSo", ".oKKo", ".oKKo", ".oHHo", "oKKKo", "ooooo"]);

  /* ------------------------------------------------------------- hair --- */

  function outlined(cells, paintCell) {
    var xs = [], ys = [];
    Object.keys(cells).forEach(function (k) {
      var c = k.split(",");
      xs.push(+c[0]); ys.push(+c[1]);
    });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var has = function (x, y) { return cells[x + "," + y] === 1; };
    var rows = [];
    for (var y = y0; y <= y1; y++) {
      var row = "";
      for (var x = x0; x <= x1; x++) {
        if (!has(x, y)) { row += "."; continue; }
        var edge = !has(x - 1, y) || !has(x + 1, y) || !has(x, y - 1) || !has(x, y + 1);
        row += edge ? "o" : paintCell(x, y, has);
      }
      rows.push(row);
    }
    return part(x0, y0, rows);
  }

  /* One (left) tail. `offsetAt(t)` bends it, t = 0 at the root, 1 at the tip;
     `flare` swings the lower half outward and up, as when falling. */
  function tailL(offsetAt, flare, tips) {
    var cells = {};
    var yEnd = 32 - Math.round(flare * 2);
    for (var y = 3; y <= yEnd; y++) {
      var w = y < 10 ? 3 + (y - 3) * 0.47 : y < 22 ? 6.3 : Math.max(1.2, 6.3 - (y - 22) * 0.55);
      var cx = y < 10 ? 6.8 - (y - 3) * 0.44 : 3.7 + Math.max(0, y - 25) * 0.14;
      var t = Math.max(0, (y - 9) / 23);
      var off = offsetAt(t) - flare * Math.pow(t, 1.4) * 2.4;
      var a = Math.round(cx + off - w / 2);
      var b = Math.round(cx + off + w / 2) - 1;
      for (var x = a; x <= b; x++) { cells[x + "," + y] = 1; }
    }
    return outlined(cells, function (x, y, has) {
      if (tips && y >= 26) { return y >= 29 ? "q" : "L"; }
      if (!has(x + 2, y)) { return "h"; }
      if (!has(x - 2, y) && y > 7 && y < 21) { return "L"; }
      return "H";
    });
  }

  /* hair = [phase step (0-15), amplitude, lean, flare]; both tails are built
     in world terms, then the right one is mirrored into place. The right
     tail runs a little behind the left, so they never move as one. */
  function tailsFor(v, hair) {
    var key = hair.join(",");
    var hit = v.tailCache[key];
    if (hit) { return hit; }
    var phase = hair[0] / 16 * Math.PI * 2;
    var amp = hair[1];
    var lean = hair[2];
    var flare = hair[3];
    var world = function (lag) {
      return function (t) {
        return lean * Math.pow(t, 1.3) * 1.8 + amp * Math.pow(t, 1.2) * Math.sin(phase + lag - 2.6 * t);
      };
    };
    var l = world(0);
    var r = world(0.8);
    hit = {
      l: tailL(l, flare, v.tips),
      r: mirror(tailL(function (t) { return -r(t); }, flare, v.tips))
    };
    v.tailCache[key] = hit;
    return hit;
  }

  /* ----------------------------------------------------------- classic --- */

  var CLASSIC = {
    name: "classic",
    label: "Pixel-art Hatsune Miku",
    pal: PAL,
    tips: false,
    earsBack: null,
    ties: pair(TIE_L),
    torso: TORSO,
    overlays: [],
    armDown: pair(ARM_DOWN_L),
    armUp: pair(ARM_UP_L),
    armWave: mirror(bend(ARM_UP_L, 5, 1)),
    legs: pair(LEG_L),
    faceBase: null,
    accessories: [part(4, 1, [
      ".ooo...",
      "oPPPo..",
      "oPYPoo.",
      "oPPPoVo",
      ".ooooVo",
      "....oo."
    ])],
    gait: "walk"
  };

  /* -------------------------------------------------------------- snow --- */

  var SNOW_UP = recolor(ARM_UP_L, { S: "G" });
  var EARMUFF = part(4, 8, [".ooo.", "oXXXo", "oXFXo", "oXXXo", ".ooo."]);

  var SNOW = {
    name: "snow",
    label: "Pixel-art Snow Miku",
    pal: merge(PAL, {
      o: "#2b3b55",
      H: "#e2edf8", h: "#a6bfdc", L: "#ffffff",
      E: "#4d93dc", e: "#1d3b6e",
      G: "#d4e5f6", g: "#a9c2df",
      K: "#8dbbe8", k: "#6b9ed6",
      w: "#8fc0ee", B: "#f6b5c2",
      F: "#5b98df", X: "#ffffff"
    }),
    tips: false,
    earsBack: null,
    ties: pair(recolor(TIE_L, { R: "F", P: "X" })),
    torso: TORSO,
    /* scarf with a snowflake print; one end hangs where the tie was */
    overlays: [part(12, 16, [
      "oXXFXXXo",
      "oXXXXXFo",
      ".oXXXo..",
      "..oXFo..",
      "..oXXo..",
      "..oXXo..",
      "...oo..."
    ])],
    armDown: pair(recolor(ARM_DOWN_L, { S: "G" })),
    armUp: pair(SNOW_UP),
    armWave: mirror(bend(SNOW_UP, 5, 1)),
    legs: pair(LEG_L),
    faceBase: null,
    accessories: [
      part(10, 2, ["..F..", "F.F.F", ".FXF.", "F.F.F", "..F.."]),
      EARMUFF, mirror(EARMUFF)
    ],
    gait: "walk"
  };

  /* ------------------------------------------------------------ rabbit --- */

  /* Sheer lavender ears with a white rim, spread in a V; airborne, they
     splay further */
  var EAR = part(9, -8, [".ooo.", "oWQQo", "oWuQo", "oWuQo", "oWuQo", "oQuQo", "oQuQo", "oQQQo", "oQQQo"]);
  var EAR_TILT = bend(bend(EAR, 5, -1), 2, -1);
  var EAR_SPLAY = bend(bend(bend(EAR, 6, -1), 4, -1), 2, -1);

  var RABBIT_UP = recolor(ARM_UP_L, { K: "S", w: "S" });

  var RABBIT = {
    name: "rabbit",
    label: "Pixel-art Rabbit Hole Miku",
    pal: merge(PAL, {
      o: "#1f1a2e",
      H: "#8fa8e0", h: "#5d6fbf", L: "#c9d7f7", q: "#a697dc",
      E: "#7d8fd8", e: "#262a58", W: "#ffffff",
      B: "#f3a6c0", M: "#7e2a45", p: "#e0607e",
      R: "#c42a5a", r: "#8e1c43",
      G: "#2b2138", g: "#4a3b5e",
      K: "#1f1a2e", k: "#3a2d3c",
      P: "#e24f8f",
      Q: "#d9d1e6", u: "#b3a5c8",
      n: "#6a5667", N: "#3a2d3c",
      w: "#ffffff"
    }),
    tips: true,
    earsBack: { rest: [EAR_TILT, mirror(EAR_TILT)], splay: [EAR_SPLAY, mirror(EAR_SPLAY)] },
    ties: pair(recolor(TIE_L, { R: "K", P: "K" })),
    /* crimson bow tie on a bare neck; strapless black suit with a pink
       neckline; the open heart low on the front */
    torso: part(9, 16, [
      ".....oSSo.....",
      "...oSRrrRSo...",
      "...oSSSSSSo...",
      "...oPgGGgPo...",
      "...oGgGGgGo...",
      "...oGGGGGGo...",
      "...oGSGSGGo...",
      "...oSSSSSGo...",
      "...oGSSSGGo...",
      "...oGGSGGGo...",
      "...ooGGGGoo...",
      ".....oooo....."
    ]),
    overlays: [],
    /* a black band on one upper arm; a white cuff and pink ribbon on the
       other wrist */
    armDown: [
      part(10, 17, [".o", "oS", "oK", "oS", "oS", "oS", "oS", ".o"]),
      mirror(part(10, 17, [".o", "oS", "oS", "oS", "oP", "ow", "oS", ".o"]))
    ],
    armUp: pair(RABBIT_UP),
    armWave: mirror(bend(RABBIT_UP, 5, 1)),
    /* fishnets all the way up, black heels */
    legs: pair(part(11, 26, [
      ".onno",
      ".onNo",
      ".oNno",
      ".onNo",
      ".oNno",
      ".onNo",
      "oKKKo",
      "ooooo"
    ])),
    /* a red mark under one eye and a small, surprised "o" */
    faceBase: [
      ".....R..MM........",
      "........MM........"
    ],
    accessories: [
      part(10, 5, ["W.W", ".W.", "W.W"])    /* white X clip on the fringe */
    ],
    gait: "hop"
  };

  [CLASSIC, SNOW, RABBIT].forEach(function (v) { v.tailCache = {}; });

  var VARIANTS = { classic: CLASSIC, snow: SNOW, rabbit: RABBIT };
  var ORDER = ["classic", "snow", "rabbit"];

  /* ---------------------------------------------------------- drawing --- */

  function paint(ctx, pal, p, dx, dy) {
    for (var y = 0; y < p.rows.length; y++) {
      var r = p.rows[y];
      for (var x = 0; x < r.length; x++) {
        var ch = r.charAt(x);
        if (ch === ".") { continue; }
        ctx.fillStyle = pal[ch];
        ctx.fillRect(p.x + x + dx, p.y + y + dy + TOP, 1, 1);
      }
    }
  }

  var REST_HAIR = [0, 0, 0, 0];

  /* f: { bob, hair: [phase, amp, lean, flare], legL, legR,
          arms: down|up|wave|waveB, face } */
  function draw(ctx, f, v) {
    var pal = v.pal;
    var b = f.bob || 0;
    var P = function (p, dy) { paint(ctx, pal, p, 0, dy === undefined ? b : dy); };
    ctx.clearRect(0, 0, W, H);
    var hair = f.hair || REST_HAIR;
    var t = tailsFor(v, hair);
    P(t.l); P(t.r);
    if (v.earsBack) {
      var ears = hair[3] >= 1 ? v.earsBack.splay : v.earsBack.rest;
      P(ears[0]); P(ears[1]);
    }
    P(v.legs[0], f.legL || 0);
    P(v.legs[1], f.legR || 0);
    P(v.torso);
    if (f.arms === "down") { P(v.armDown[0]); P(v.armDown[1]); }
    else if (f.arms === "wave" || f.arms === "waveB") { P(v.armDown[0]); }
    v.overlays.forEach(function (p) { P(p); });
    P(HEAD);
    if (v.faceBase) { P(part(HEAD.x, HEAD.y + 13, v.faceBase)); }
    var face = FACE[f.face || "open"];
    if (face) { P(part(HEAD.x, HEAD.y + 10, face)); }
    P(LOCK_L); P(LOCK_R);
    P(v.ties[0]); P(v.ties[1]);
    v.accessories.forEach(function (p) { P(p); });
    if (f.arms === "up") { P(v.armUp[0]); P(v.armUp[1]); }
    else if (f.arms === "wave") { P(v.armUp[1]); }
    else if (f.arms === "waveB") { P(v.armWave); }
  }

  /* ----------------------------------------------------------- sparks --- */

  /* A tiny sprite from a mask, optionally outlined outside the mask */
  function sprite(w, h, cells, fill, outline, hi) {
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var g = c.getContext("2d");
    var has = function (x, y) { return cells[x + "," + y] === 1; };
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        if (has(x, y)) {
          g.fillStyle = hi && hi[0] === x && hi[1] === y ? "#ffffff" : fill;
        } else if (outline && (has(x - 1, y) || has(x + 1, y) || has(x, y - 1) || has(x, y + 1) ||
                               has(x - 1, y - 1) || has(x + 1, y + 1) || has(x - 1, y + 1) || has(x + 1, y - 1))) {
          g.fillStyle = outline;
        } else { continue; }
        g.fillRect(x, y, 1, 1);
      }
    }
    return c.toDataURL();
  }

  function cellsOf(list) {
    var o = {};
    list.forEach(function (p) { o[p[0] + "," + p[1]] = 1; });
    return o;
  }

  /* A playing card, as scattered in the reference */
  function card() {
    var c = document.createElement("canvas");
    c.width = 7; c.height = 9;
    var g = c.getContext("2d");
    g.fillStyle = "#1f1a2e"; g.fillRect(0, 0, 7, 9);
    g.fillStyle = "#ffffff"; g.fillRect(1, 1, 5, 7);
    g.fillStyle = "#c42a5a";
    [[2, 3], [4, 3], [2, 4], [3, 4], [4, 4], [3, 5]].forEach(function (p) { g.fillRect(p[0], p[1], 1, 1); });
    return c.toDataURL();
  }

  var NOTE = cellsOf([[4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [5, 1], [5, 2], [6, 2], [6, 3], [6, 4],
    [2, 6], [3, 6], [1, 7], [2, 7], [3, 7], [1, 8], [2, 8], [3, 8]]);
  var HEART = cellsOf([[2, 1], [3, 1], [5, 1], [6, 1], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
    [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [3, 4], [4, 4], [5, 4], [4, 5]]);
  var FLAKE = cellsOf([[3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [6, 3],
    [1, 1], [5, 5], [1, 5], [5, 1]]);

  function sparksFor(v) {
    if (v.name === "snow") {
      return [sprite(7, 7, FLAKE, "#5b98df", null, [3, 3]), sprite(7, 7, FLAKE, "#9cc7f2", null, [3, 3])];
    }
    if (v.name === "rabbit") {
      return [sprite(9, 7, HEART, "#e24f8f", "#1f1a2e", [2, 2]), card()];
    }
    return [sprite(9, 11, NOTE, PAL.H, PAL.o, [2, 7]), sprite(9, 11, NOTE, PAL.P, PAL.o, [2, 7])];
  }

  /* Probe surface: lets a harness render any frame and read their state */
  var api = { W: W, H: H, variants: ORDER, draw: function (ctx, f, name) { draw(ctx, f, VARIANTS[name || "classic"]); } };
  window.__pixelMiku = api;
  if (host.hasAttribute("data-miku-sheet")) { return; }

  /* ------------------------------------------------------------ stage --- */

  /* The stage floats over the page; it lives in <body> so no ancestor can
     capture its fixed positioning */
  document.body.appendChild(host);
  host.classList.add("is-floating");

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var scale = 3;
  var stageW = 0;
  var toggle = null;
  var spriteW = W * scale;
  function measure() {
    scale = parseFloat(getComputedStyle(host).getPropertyValue("--s")) || 3;
    /* leave the corner to the hide switch */
    stageW = host.clientWidth - (toggle ? toggle.offsetWidth + 12 : 0);
    spriteW = W * scale;
  }
  measure();

  /* At the foot of the page they stand on the footer rule instead of over
     the footer's links */
  var footer = document.querySelector(".page__footer");
  var liftQueued = false;
  function lift() {
    liftQueued = false;
    var gap = footer ? window.innerHeight - footer.getBoundingClientRect().top : 0;
    host.style.setProperty("--lift", Math.max(0, Math.round(gap)) + "px");
  }
  function queueLift() {
    if (!liftQueued) { liftQueued = true; window.requestAnimationFrame(lift); }
  }
  window.addEventListener("scroll", queueLift, { passive: true });
  /* the footer also moves without any scroll: late images, fonts, a
     collapsing section all change the page's height */
  if ("ResizeObserver" in window) { new ResizeObserver(queueLift).observe(document.body); }
  lift();

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function snap(v) { return Math.round(v / scale) * scale; }

  var spots = stageW > 700 ? [0.62, 0.74, 0.86] : [0.18, 0.5, 0.82];

  var chars = ORDER.map(function (name, i) {
    var v = VARIANTS[name];
    var shadow = document.createElement("span");
    shadow.className = "miku-shadow";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "miku miku--" + name;
    btn.title = "Click me ♪";
    btn.setAttribute("aria-label", v.label + ". Press to make her jump and sing.");
    var canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    btn.appendChild(canvas);
    host.appendChild(shadow);
    host.appendChild(btn);
    return {
      v: v, btn: btn, shadow: shadow, ctx: canvas.getContext("2d"), sparks: sparksFor(v),
      x: clamp(stageW * spots[i] - spriteW / 2, 0, Math.max(0, stageW - spriteW)),
      y: 0, dir: i % 2 ? 1 : -1, target: null, slot: 0, mode: "idle",
      jumpT: -1, jumpDur: 0.56, jumpH: 14, hopPhase: 0, running: false,
      hover: false, blinkAt: 0, waveUntil: 0, happyUntil: 0, squashUntil: 0,
      nextWander: 1500 + i * 1700, nextIdleHop: 4000 + Math.random() * 4000,
      nextFlake: 1200, frame: "",
      /* hair state: phase runs continuously; kick is the swing left over
         from a stop or a landing, and dies away */
      hairPhase: i * 2.1, kick: 0
    };
  });

  var running = false;
  var raf = 0;
  var last = 0;
  var greeted = false;

  /* The switch that tucks them away, remembered per visitor */
  var away = false;
  try { away = window.localStorage.getItem("miku-away") === "1"; } catch (e) { /* private mode */ }
  toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "miku-toggle";
  host.appendChild(toggle);
  function setAway(on) {
    away = on;
    host.classList.toggle("is-away", on);
    toggle.textContent = on ? "♪ Miku" : "Hide";
    toggle.setAttribute("aria-label", on ? "Show the pixel Mikus" : "Hide the pixel Mikus");
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    chars.forEach(function (c) { c.btn.tabIndex = on ? -1 : 0; });
    try { window.localStorage.setItem("miku-away", on ? "1" : "0"); } catch (e) { /* private mode */ }
  }
  setAway(away);
  measure();
  chars.forEach(function (c) { c.x = clamp(c.x, 0, Math.max(0, stageW - spriteW)); });

  function place(c) {
    c.btn.style.setProperty("--x", snap(c.x) + "px");
    c.btn.style.setProperty("--y", snap(c.y) + "px");
    c.btn.style.setProperty("--dir", c.dir);
    c.shadow.style.setProperty("--x", snap(c.x) + "px");
    c.shadow.style.setProperty("--shadow", (1 - Math.min(0.45, -c.y / (scale * 40))).toFixed(3));
  }

  function show(c, f) {
    var key = JSON.stringify(f);
    if (key === c.frame) { return; }
    c.frame = key;
    draw(c.ctx, f, c.v);
  }

  function spark(c, count) {
    for (var i = 0; i < count; i++) {
      (function (i) {
        window.setTimeout(function () {
          var n = document.createElement("span");
          n.className = "miku-note miku-note--" + c.v.name;
          n.setAttribute("aria-hidden", "true");
          n.style.backgroundImage = "url(" + c.sparks[i % 2] + ")";
          var headX = snap(c.x) + (c.dir > 0 ? 20 : 4) * scale;
          var drift = (Math.random() * 30 + 10) * (headX > stageW / 2 ? -1 : 1);
          n.style.setProperty("--nx", clamp(headX, 0, stageW - 9 * scale) + "px");
          n.style.setProperty("--ny", (c.y - 30 * scale) + "px");
          n.style.setProperty("--drift", drift.toFixed(1) + "px");
          host.appendChild(n);
          window.setTimeout(function () { if (n.parentNode) { n.parentNode.removeChild(n); } }, 1700);
        }, i * 120);
      })(i);
    }
  }

  /* Snow Miku's weather: a flake now and then, falling past her */
  function flake(c) {
    var n = document.createElement("span");
    n.className = "miku-flake";
    n.setAttribute("aria-hidden", "true");
    n.style.backgroundImage = "url(" + c.sparks[Math.random() < 0.5 ? 0 : 1] + ")";
    n.style.setProperty("--nx", clamp(snap(c.x) + Math.random() * spriteW, 0, stageW - 7 * scale) + "px");
    n.style.setProperty("--ny", (-(H + 6) * scale) + "px");
    n.style.setProperty("--drift", ((Math.random() - 0.5) * 36).toFixed(1) + "px");
    host.appendChild(n);
    window.setTimeout(function () { if (n.parentNode) { n.parentNode.removeChild(n); } }, 3400);
  }

  api.state = function () {
    return chars.map(function (c) {
      return { name: c.v.name, x: c.x, y: c.y, dir: c.dir, mode: c.mode, target: c.target,
               frame: c.frame, running: running, away: away, scale: scale, stageW: stageW };
    });
  };

  /* Reduced motion: still frames; pressing changes expression only */
  if (reduce) {
    var still = { bob: 0, hair: REST_HAIR, legL: 0, legR: 0, arms: "down", face: "open" };
    chars.forEach(function (c) {
      c.dir = 1;
      place(c);
      show(c, still);
      c.btn.addEventListener("click", function () {
        show(c, { bob: 0, hair: REST_HAIR, legL: 0, legR: 0, arms: "up", face: "happy" });
        window.setTimeout(function () { show(c, still); }, 900);
      });
    });
    toggle.addEventListener("click", function () { setAway(!away); });
    window.addEventListener("resize", function () { measure(); lift(); });
    return;
  }

  /* --------------------------------------------------------- behaviour --- */

  var pointerX = null;
  var pointerAt = -1e9;

  function jump(c, dur, height, sing) {
    if (c.jumpT >= 0) { return; }
    c.jumpT = 0;
    c.jumpDur = dur;
    c.jumpH = height;
    c.target = null;
    if (sing) {
      c.happyUntil = performance.now() + 1100;
      spark(c, 3);
    }
  }

  chars.forEach(function (c) {
    c.btn.addEventListener("click", function () {
      jump(c, 0.56, 14, true);
      /* the other two join in: turn to her and hop, one after the other */
      chars.filter(function (o) { return o !== c; }).forEach(function (o, k) {
        window.setTimeout(function () {
          o.dir = c.x > o.x ? 1 : -1;
          o.happyUntil = performance.now() + 700;
          jump(o, 0.4, 6, false);
        }, 180 + k * 160);
      });
    });
    c.btn.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") { c.hover = true; }
    });
    c.btn.addEventListener("pointerleave", function () { c.hover = false; });
  });

  /* The pointer only calls them when it comes down near their floor */
  function near(e) {
    var r = host.getBoundingClientRect();
    return e.clientY > r.top - 240 && e.clientY < r.top + 40;
  }
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || !running || !near(e)) { return; }
    pointerX = e.clientX - host.getBoundingClientRect().left;
    pointerAt = performance.now();
  }, { passive: true });
  window.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" || !running || !near(e)) { return; }
    for (var i = 0; i < chars.length; i++) { if (chars[i].btn.contains(e.target)) { return; } }
    if (toggle.contains(e.target)) { return; }
    pointerX = e.clientX - host.getBoundingClientRect().left;
    pointerAt = performance.now();
  }, { passive: true });

  window.addEventListener("resize", function () {
    measure();
    lift();
    chars.forEach(function (c) {
      c.x = clamp(c.x, 0, Math.max(0, stageW - spriteW));
      place(c);
    });
  });

  function step(c, now, dt, following, left, right, maxX) {
    var wasMoving = c.mode === "walk" || c.mode === "jump";

    if (c.jumpT >= 0) {
      c.jumpT += dt / c.jumpDur;
      if (c.jumpT >= 1) {
        c.jumpT = -1;
        c.y = 0;
        c.squashUntil = now + 110;
        c.kick = Math.max(c.kick, c.jumpH > 10 ? 1.6 : 0.9);
      } else {
        c.y = -c.jumpH * scale * 4 * c.jumpT * (1 - c.jumpT);
      }
      c.mode = "jump";
      return;
    }

    if (c.hover || now < c.waveUntil) {
      c.mode = "idle";
      c.y = 0;
      return;
    }

    var gap = spriteW * 0.85;
    var lo = left ? left.x + gap : 0;
    var hi = right ? right.x - gap : maxX;

    if (following) {
      var want = clamp(c.slot, 0, maxX);
      /* hysteresis: don't shuffle for a pointer that is already on her */
      if (c.mode === "walk" || Math.abs(want - c.x) > spriteW * 0.25) {
        c.target = want;
      } else {
        c.target = null;
        c.dir = pointerX > c.x + spriteW / 2 ? 1 : -1;
      }
    } else if (c.target === null && now > c.nextWander) {
      if (hi - lo > spriteW * 0.4) {
        var hop = (50 + Math.random() * 160) * (Math.random() < 0.5 ? -1 : 1);
        c.target = clamp(c.x + hop, Math.max(0, lo), Math.min(maxX, hi));
      } else {
        c.nextWander = now + 2000;
      }
    }

    if (c.target !== null) {
      var d = c.target - c.x;
      var far = Math.abs(d);
      /* strolls on her own; toward the pointer she hurries, faster the
         further it is, and eases into a walk as she gets close */
      var speed = (following ? clamp(far * 1.5, 70, 300) : 46) * scale / 3;
      if (far <= speed * dt || far < 1) {
        c.x = c.target;
        c.target = null;
        c.mode = "idle";
        c.y = 0;
        c.nextWander = now + 3500 + Math.random() * 5500;
      } else {
        /* she never walks into a neighbour: if one is in the way, she
           waits for her to move on */
        var nx = c.x + (d > 0 ? 1 : -1) * speed * dt;
        c.x = clamp(nx, Math.min(c.x, lo), Math.max(c.x, hi));
        c.dir = d > 0 ? 1 : -1;
        c.mode = "walk";
        c.running = speed > 140 * scale / 3;
        if (c.v.gait === "hop") {
          c.hopPhase += dt * (c.running ? 13 : 9);
          c.y = -Math.abs(Math.sin(c.hopPhase)) * 5 * scale;
        }
      }
    } else {
      c.mode = "idle";
      c.y = 0;
    }

    /* stopping throws the hair forward; it swings on a little */
    if (wasMoving && c.mode === "idle") { c.kick = Math.max(c.kick, 1.2); }

    if (c.mode === "idle" && c.v.gait === "hop" && now > c.nextIdleHop) {
      c.nextIdleHop = now + 5000 + Math.random() * 6000;
      jump(c, 0.42, 7, false);
    }
    if (c.v.name === "snow" && now > c.nextFlake) {
      c.nextFlake = now + 1600 + Math.random() * 2600;
      flake(c);
    }
  }

  function update(now, dt) {
    var maxX = Math.max(0, stageW - spriteW);
    var following = now - pointerAt < 2500;
    var sorted = chars.slice().sort(function (a, b) { return a.x - b.x; });
    if (following) {
      /* gather round the pointer in a row, keeping their current order;
         if the pointer is resting on one of them, she is the centre */
      var gap = spriteW * 0.95;
      var span = gap * (sorted.length - 1);
      var start = pointerX - spriteW / 2 - span / 2;
      sorted.forEach(function (c, k) { if (c.hover) { start = c.x - k * gap; } });
      start = clamp(start, 0, Math.max(0, maxX - span));
      sorted.forEach(function (c, k) { c.slot = start + k * gap; });
    }
    sorted.forEach(function (c, k) {
      step(c, now, dt, following, sorted[k - 1], sorted[k + 1], maxX);
      /* hair: a travelling wave whose speed follows what she is doing;
         the leftover swing decays with a half-life of about 0.35 s */
      var rate = c.mode === "walk" ? (c.running ? 11 : 8) : c.mode === "jump" ? 9 : 3.6;
      c.hairPhase += dt * rate;
      c.kick *= Math.exp(-dt * 2);
    });
  }

  function hairFor(c) {
    var q = function (v, stepSize) { return Math.round(v / stepSize) * stepSize; };
    var phase = ((Math.round(c.hairPhase / (Math.PI * 2) * 16) % 16) + 16) % 16;
    var amp = 0.9;
    var lean = 0;
    var flare = 0;
    if (c.mode === "walk") {
      amp = 0.8;
      lean = c.running ? -2 : -1.4;   /* sprite-local: trails behind her */
      if (c.v.gait === "hop" && c.y < -2 * scale) { flare = 1; }
    } else if (c.mode === "jump") {
      amp = 0.5;
      /* dragged down on the way up, flung out on the way down */
      flare = c.jumpT < 0.45 ? 0 : c.jumpT < 0.7 ? 1 : 1.5;
      lean = c.jumpT < 0.45 ? 0 : 0.5;
    }
    amp += c.kick;
    return [phase, q(Math.min(amp, 2.5), 0.25), q(lean, 0.5), flare];
  }

  function frameFor(c, now) {
    var f = { bob: 0, hair: hairFor(c), legL: 0, legR: 0, arms: "down", face: "open" };

    if (now > c.blinkAt + 130) {
      c.blinkAt = now + 2200 + Math.random() * 3400;
    }
    if (now >= c.blinkAt && now < c.blinkAt + 130) { f.face = "blink"; }

    if (c.mode === "jump") {
      var big = c.jumpH > 10;
      f.arms = big ? "up" : "down";
      if (big || now < c.happyUntil) { f.face = "happy"; }
      if (c.jumpT > 0.12 && c.jumpT < 0.88) { f.legL = -1; f.legR = -1; }
      return f;
    }
    if (now < c.squashUntil) { f.bob = 1; f.face = "happy"; return f; }

    if (c.mode === "walk") {
      if (c.v.gait === "hop") {
        var air = c.y < -2 * scale;
        f.legL = air ? -1 : 0;
        f.legR = air ? -1 : 0;
        f.bob = air ? 0 : 1;
        return f;
      }
      var cyc = Math.floor(now / (c.running ? 90 : 130)) % 4;
      f.legL = cyc === 1 ? -1 : 0;
      f.legR = cyc === 3 ? -1 : 0;
      return f;
    }

    f.bob = Math.floor(now / 650) % 2;
    if (c.hover || now < c.waveUntil) {
      f.face = "happy";
      f.arms = Math.floor(now / 190) % 2 ? "waveB" : "wave";
      f.bob = 0;
    } else if (now < c.happyUntil) {
      f.face = "happy";
    }
    return f;
  }

  function tick(now) {
    raf = 0;
    if (!running) { return; }
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(now, dt);
    lift();
    chars.forEach(function (c) {
      place(c);
      show(c, frameFor(c, now));
    });
    raf = window.requestAnimationFrame(tick);
  }

  function setRunning() {
    running = !away && document.visibilityState !== "hidden";
    if (running && !raf) {
      last = performance.now();
      raf = window.requestAnimationFrame(tick);
    }
    if (running && !greeted) {
      greeted = true;
      /* the invitation: first time they're seen, they wave in turn */
      chars.forEach(function (c, k) {
        window.setTimeout(function () {
          c.waveUntil = performance.now() + 1300;
          spark(c, 1);
        }, 700 + k * 450);
      });
    }
  }

  toggle.addEventListener("click", function () {
    setAway(!away);
    setRunning();
  });
  document.addEventListener("visibilitychange", setRunning);

  chars.forEach(function (c) {
    place(c);
    show(c, frameFor(c, performance.now()));
  });
  setRunning();
})();
