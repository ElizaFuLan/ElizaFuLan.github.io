/* Pixel Miku: a hand-authored 32x34 sprite who lives on the footer rule.

   She is never still for long: she breathes, blinks and sways her twin tails,
   and now and then wanders along the line. Bring the pointer near and she
   walks over to it; hover her and she waves; click her (or press Enter) and
   she jumps and sings. Colours are sampled from the avatar.

   Decorative and additive: without JS nothing is drawn; with reduced motion
   she stands still and only changes expression when pressed. */
(function () {
  "use strict";

  var host = document.querySelector("[data-miku]");
  var probe = document.createElement("canvas");
  if (!host || !probe.getContext) { return; }

  var W = 32;
  var H = 34;

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

  function mirror(p) {
    var width = 0;
    p.rows.forEach(function (r) { width = Math.max(width, r.length); });
    return part(W - p.x - width, p.y, p.rows.map(function (r) {
      while (r.length < width) { r += "."; }
      return r.split("").reverse().join("");
    }));
  }

  /* Shift the top `n` rows sideways: bends a raised arm at the elbow */
  function bend(p, n, dx) {
    return part(p.x, p.y, p.rows.map(function (r, i) {
      if (i >= n) { return r; }
      return dx > 0 ? new Array(dx + 1).join(".") + r : r.slice(-dx);
    }));
  }

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

  /* Flower cluster from the avatar's hat, pinned above the left tail */
  var FLOWER = part(4, 1, [
    ".ooo...",
    "oPPPo..",
    "oPYPoo.",
    "oPPPoVo",
    ".ooooVo",
    "....oo."
  ]);

  var TIE_L = part(5, 5, ["oo", "RP", "oo"]);
  var TIE_R = mirror(TIE_L);

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
  var ARM_DOWN_R = mirror(ARM_DOWN_L);

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
  var ARM_UP_R = mirror(ARM_UP_L);
  var ARM_WAVE_R = mirror(bend(ARM_UP_L, 5, 1));

  var LEG_L = part(11, 28, [".oSSo", ".oKKo", ".oKKo", ".oHHo", "oKKKo", "ooooo"]);
  var LEG_R = mirror(LEG_L);

  /* Twin tails are generated, not drawn: a mask along a curve, outlined on
     its own border, shaded on the inner edge. `sway` bends the lower half. */
  function outlined(cells, paint) {
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
        row += edge ? "o" : paint(x, y, has);
      }
      rows.push(row);
    }
    return part(x0, y0, rows);
  }

  function tailL(sway) {
    var cells = {};
    for (var y = 3; y <= 32; y++) {
      var w = y < 10 ? 3 + (y - 3) * 0.47 : y < 22 ? 6.3 : Math.max(1.2, 6.3 - (y - 22) * 0.55);
      var cx = y < 10 ? 6.8 - (y - 3) * 0.44 : 3.7 + Math.max(0, y - 25) * 0.14;
      var off = sway * Math.pow(Math.max(0, (y - 9) / 23), 1.3) * 1.7;
      var a = Math.round(cx + off - w / 2);
      var b = Math.round(cx + off + w / 2) - 1;
      for (var x = a; x <= b; x++) { cells[x + "," + y] = 1; }
    }
    return outlined(cells, function (x, y, has) {
      if (!has(x + 2, y)) { return "h"; }
      if (!has(x - 2, y) && y > 7 && y < 21) { return "L"; }
      return "H";
    });
  }

  var TAILS = {};
  [-1, 0, 1].forEach(function (s) {
    TAILS[s] = { l: tailL(s), r: mirror(tailL(-s)) };
  });

  /* An eighth note, outlined outside its own mask */
  function note(fill) {
    var cells = {};
    var add = function (x, y) { cells[x + "," + y] = 1; };
    for (var y = 1; y <= 7; y++) { add(4, y); }
    add(5, 1); add(5, 2); add(6, 2); add(6, 3); add(6, 4);
    add(2, 6); add(3, 6); add(1, 7); add(2, 7); add(3, 7); add(1, 8); add(2, 8); add(3, 8);
    var c = document.createElement("canvas");
    c.width = 9; c.height = 11;
    var g = c.getContext("2d");
    for (var yy = 0; yy < 11; yy++) {
      for (var xx = 0; xx < 9; xx++) {
        var inside = cells[xx + "," + yy] === 1;
        var near = false;
        for (var dy = -1; dy <= 1 && !inside; dy++) {
          for (var dx = -1; dx <= 1; dx++) {
            if (cells[(xx + dx) + "," + (yy + dy)] === 1) { near = true; }
          }
        }
        if (!inside && !near) { continue; }
        g.fillStyle = inside ? (xx === 2 && yy === 7 ? PAL.W : fill) : PAL.o;
        g.fillRect(xx, yy, 1, 1);
      }
    }
    return c.toDataURL();
  }

  /* ---------------------------------------------------------- drawing --- */

  function paint(ctx, p, dx, dy) {
    for (var y = 0; y < p.rows.length; y++) {
      var r = p.rows[y];
      for (var x = 0; x < r.length; x++) {
        var ch = r.charAt(x);
        if (ch === ".") { continue; }
        ctx.fillStyle = PAL[ch];
        ctx.fillRect(p.x + x + dx, p.y + y + dy, 1, 1);
      }
    }
  }

  /* f: { bob, sway, legL, legR, arms: down|up|wave|waveB, face } */
  function draw(ctx, f) {
    var b = f.bob || 0;
    ctx.clearRect(0, 0, W, H);
    var t = TAILS[f.sway || 0];
    paint(ctx, t.l, 0, b);
    paint(ctx, t.r, 0, b);
    paint(ctx, LEG_L, 0, f.legL || 0);
    paint(ctx, LEG_R, 0, f.legR || 0);
    paint(ctx, TORSO, 0, b);
    if (f.arms === "down") {
      paint(ctx, ARM_DOWN_L, 0, b);
      paint(ctx, ARM_DOWN_R, 0, b);
    } else if (f.arms === "wave" || f.arms === "waveB") {
      paint(ctx, ARM_DOWN_L, 0, b);
    }
    paint(ctx, HEAD, 0, b);
    var face = FACE[f.face || "open"];
    if (face) { paint(ctx, part(HEAD.x, HEAD.y + 10, face), 0, b); }
    paint(ctx, LOCK_L, 0, b);
    paint(ctx, LOCK_R, 0, b);
    paint(ctx, TIE_L, 0, b);
    paint(ctx, TIE_R, 0, b);
    paint(ctx, FLOWER, 0, b);
    if (f.arms === "up") {
      paint(ctx, ARM_UP_L, 0, b);
      paint(ctx, ARM_UP_R, 0, b);
    } else if (f.arms === "wave") {
      paint(ctx, ARM_UP_R, 0, b);
    } else if (f.arms === "waveB") {
      paint(ctx, ARM_WAVE_R, 0, b);
    }
  }

  /* Probe surface: lets a harness render any frame and read her state */
  var api = { W: W, H: H, draw: draw };
  window.__pixelMiku = api;
  if (host.hasAttribute("data-miku-sheet")) { return; }

  /* ------------------------------------------------------------ stage --- */

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var shadow = document.createElement("span");
  shadow.className = "miku-shadow";
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "miku";
  btn.title = "Click me ♪";
  btn.setAttribute("aria-label", "Pixel-art Hatsune Miku. Press to make her jump and sing.");
  var canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  btn.appendChild(canvas);
  host.appendChild(shadow);
  host.appendChild(btn);
  var ctx = canvas.getContext("2d");

  var NOTES = [note(PAL.H), note(PAL.P)];

  var scale = 3;
  var stageW = 0;
  var spriteW = W * scale;
  function measure() {
    scale = parseFloat(getComputedStyle(host).getPropertyValue("--s")) || 3;
    stageW = host.clientWidth;
    spriteW = W * scale;
  }
  measure();

  var st = {
    x: Math.max(0, stageW * 0.72 - spriteW / 2),
    y: 0,
    dir: -1,
    target: null,
    mode: "idle",
    jumpT: -1,
    hover: false,
    pointerX: null,
    pointerAt: -1e9,
    blinkAt: 0,
    blinkUntil: 0,
    waveUntil: 0,
    happyUntil: 0,
    squashUntil: 0,
    nextWander: 0,
    frame: ""
  };

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function snap(v) { return Math.round(v / scale) * scale; }

  function place() {
    btn.style.setProperty("--x", snap(st.x) + "px");
    btn.style.setProperty("--y", snap(st.y) + "px");
    btn.style.setProperty("--dir", st.dir);
    shadow.style.setProperty("--x", snap(st.x) + "px");
    shadow.style.setProperty("--shadow", (1 - Math.min(0.45, -st.y / (scale * 40))).toFixed(3));
  }

  function show(f) {
    var key = JSON.stringify(f);
    if (key === st.frame) { return; }
    st.frame = key;
    draw(ctx, f);
  }

  function sing(count) {
    for (var i = 0; i < count; i++) {
      (function (i) {
        window.setTimeout(function () {
          var n = document.createElement("span");
          n.className = "miku-note";
          n.setAttribute("aria-hidden", "true");
          n.style.backgroundImage = "url(" + NOTES[i % 2] + ")";
          var headX = snap(st.x) + (st.dir > 0 ? 20 : 4) * scale;
          var drift = (Math.random() * 30 + 10) * (headX > stageW / 2 ? -1 : 1);
          n.style.setProperty("--nx", clamp(headX, 0, stageW - 9 * scale) + "px");
          n.style.setProperty("--ny", (st.y - 26 * scale) + "px");
          n.style.setProperty("--drift", drift.toFixed(1) + "px");
          host.appendChild(n);
          window.setTimeout(function () { if (n.parentNode) { n.parentNode.removeChild(n); } }, 1700);
        }, i * 120);
      })(i);
    }
  }

  api.state = function () {
    return { x: st.x, y: st.y, dir: st.dir, mode: st.mode, target: st.target,
             frame: st.frame, running: running, scale: scale, stageW: stageW };
  };

  /* Reduced motion: one still frame; pressing changes her expression only */
  if (reduce) {
    st.dir = 1;
    place();
    var still = { bob: 0, sway: 0, legL: 0, legR: 0, arms: "down", face: "open" };
    show(still);
    btn.addEventListener("click", function () {
      show({ bob: 0, sway: 0, legL: 0, legR: 0, arms: "up", face: "happy" });
      window.setTimeout(function () { show(still); }, 900);
    });
    var running = false;
    return;
  }

  /* --------------------------------------------------------- behaviour --- */

  function jump() {
    if (st.jumpT >= 0) { return; }
    st.jumpT = 0;
    st.target = null;
    st.happyUntil = performance.now() + 1100;
    sing(3);
  }

  btn.addEventListener("click", jump);
  btn.addEventListener("pointerenter", function (e) {
    if (e.pointerType === "mouse") { st.hover = true; }
  });
  btn.addEventListener("pointerleave", function () { st.hover = false; });

  /* The pointer only calls her when it is down near her line */
  function near(e) {
    var r = host.getBoundingClientRect();
    return e.clientY > r.top - 300 && e.clientY < r.top + 160;
  }
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || !running || !near(e)) { return; }
    st.pointerX = e.clientX - host.getBoundingClientRect().left;
    st.pointerAt = performance.now();
  }, { passive: true });
  window.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" || !running || !near(e) || btn.contains(e.target)) { return; }
    st.target = clamp(e.clientX - host.getBoundingClientRect().left - spriteW / 2, 0, stageW - spriteW);
  }, { passive: true });

  window.addEventListener("resize", function () {
    measure();
    st.x = clamp(st.x, 0, Math.max(0, stageW - spriteW));
    place();
  });

  function update(now, dt) {
    var maxX = Math.max(0, stageW - spriteW);
    var following = now - st.pointerAt < 2500;
    /* strolls on her own; toward the pointer she hurries, faster the further
       it is, and eases into a walk as she gets close */
    var far = st.target === null ? 0 : Math.abs(st.target - st.x);
    var speed = (following ? clamp(far * 1.5, 70, 300) : 46) * scale / 3;

    if (st.jumpT >= 0) {
      st.jumpT += dt / 0.56;
      if (st.jumpT >= 1) {
        st.jumpT = -1;
        st.y = 0;
        st.squashUntil = now + 110;
      } else {
        st.y = -14 * scale * 4 * st.jumpT * (1 - st.jumpT);
      }
      st.mode = "jump";
      return;
    }

    if (st.hover || now < st.waveUntil) {
      st.mode = "idle";
      return;
    }

    if (following) {
      var want = clamp(st.pointerX - spriteW / 2, 0, maxX);
      var gap = want - st.x;
      /* hysteresis: don't shuffle for a pointer that is already on her */
      if (st.mode === "walk" || Math.abs(gap) > spriteW * 0.35) {
        st.target = want;
      } else {
        st.target = null;
        st.dir = st.pointerX > st.x + spriteW / 2 ? 1 : -1;
      }
    } else if (st.target === null && now > st.nextWander) {
      var hop = (60 + Math.random() * 180) * (Math.random() < 0.5 ? -1 : 1);
      st.target = clamp(st.x + hop, 0, maxX);
    }

    if (st.target !== null) {
      var d = st.target - st.x;
      if (Math.abs(d) <= speed * dt || Math.abs(d) < 1) {
        st.x = st.target;
        st.target = null;
        st.mode = "idle";
        st.nextWander = now + 3500 + Math.random() * 5500;
      } else {
        st.x += (d > 0 ? 1 : -1) * speed * dt;
        st.dir = d > 0 ? 1 : -1;
        st.mode = "walk";
        st.running = speed > 140 * scale / 3;
      }
    } else {
      st.mode = "idle";
    }
  }

  function frameFor(now) {
    var f = { bob: 0, sway: 0, legL: 0, legR: 0, arms: "down", face: "open" };

    if (now > st.blinkAt + 130) {
      st.blinkAt = now + 2200 + Math.random() * 3400;
    }
    if (now >= st.blinkAt && now < st.blinkAt + 130) { f.face = "blink"; }

    if (st.mode === "jump") {
      f.arms = "up";
      f.face = "happy";
      if (st.jumpT > 0.12 && st.jumpT < 0.88) { f.legL = -1; f.legR = -1; }
      f.sway = st.jumpT < 0.5 ? 1 : -1;
      return f;
    }
    if (now < st.squashUntil) { f.bob = 1; f.face = "happy"; return f; }

    if (st.mode === "walk") {
      var c = Math.floor(now / (st.running ? 90 : 130)) % 4;
      f.legL = c === 1 ? -1 : 0;
      f.legR = c === 3 ? -1 : 0;
      f.sway = c % 2 ? -1 : 0;
      return f;
    }

    f.bob = Math.floor(now / 650) % 2;
    f.sway = [0, 1, 0, -1][Math.floor(now / 420) % 4];
    if (st.hover || now < st.waveUntil) {
      f.face = "happy";
      f.arms = Math.floor(now / 190) % 2 ? "waveB" : "wave";
      f.bob = 0;
    } else if (now < st.happyUntil) {
      f.face = "happy";
    }
    return f;
  }

  var running = false;
  var raf = 0;
  var last = 0;
  var greeted = false;

  function tick(now) {
    raf = 0;
    if (!running) { return; }
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(now, dt);
    place();
    show(frameFor(now));
    raf = window.requestAnimationFrame(tick);
  }

  function setRunning(on) {
    running = on && document.visibilityState !== "hidden";
    if (running && !raf) {
      last = performance.now();
      raf = window.requestAnimationFrame(tick);
    }
  }

  var visible = false;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      setRunning(visible);
      if (visible && !greeted) {
        greeted = true;
        /* the invitation: first time she's seen, she waves and hums */
        window.setTimeout(function () {
          st.waveUntil = performance.now() + 1500;
          sing(1);
        }, 500);
      }
    }, { rootMargin: "120px 0px 0px 0px" }).observe(btn);
  } else {
    visible = true;
    setRunning(true);
  }
  document.addEventListener("visibilitychange", function () { setRunning(visible); });

  place();
  show(frameFor(performance.now()));
})();
