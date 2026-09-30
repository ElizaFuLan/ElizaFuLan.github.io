/* UIBDiffusion: forward noising, then backdoored decoding.

   Two copies of the same image go through a backdoored diffusion model, laid
   out as in the paper's figure. The lower copy is poisoned with UIBDiffusion's
   trigger τ, too small to see.

     forward    both are noised step by step, t = 0 → 1000. The trigger stays
                in the poisoned copy the whole way, so its x_T is "noise + τ";
                side by side the two x_T are indistinguishable.
     backward   the backdoored UNet denoises, t = 1000 → 0. Clean noise decodes
                back to an ordinary image; noise + τ decodes to the attacker's
                target, and is the target at every step of the way.

   A film strip records each lane left to right. This is an illustration, not
   model samples: frames are composed with x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε on
   a cosine schedule, from the images in the paper's own figure. The static
   figure in the markup is the no-script fallback; under reduced motion the
   finished frame is shown. */
(function () {
  "use strict";

  var mount = document.querySelector("[data-bdec]");
  if (!mount || !document.createElement("canvas").getContext) { return; }

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var N = 128;                      /* working resolution */
  var T = 1000;
  var FWD = [200, 400, 600, 800];   /* snapshots while noising */
  var BWD = [800, 600, 400, 200];   /* snapshots while denoising */
  var NOISE_SHOW = 0.6;             /* ε as displayed */
  var TRIG = 0.05;                  /* τ as added to the image: 1/20 of the inset */
  var FWD_MS = 3600;
  var BWD_MS = 4800;
  var dir = mount.getAttribute("data-bdec") || "/images/publications/uib-anim/";

  /* ------------------------------------------------------------ pixels --- */

  function load(name) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var c = document.createElement("canvas");
        c.width = N; c.height = N;
        var g = c.getContext("2d");
        g.drawImage(img, 0, 0, N, N);
        var d = g.getImageData(0, 0, N, N).data;
        var out = new Float32Array(N * N * 3);
        for (var i = 0, j = 0; i < d.length; i += 4, j += 3) {
          out[j] = d[i] / 127.5 - 1;
          out[j + 1] = d[i + 1] / 127.5 - 1;
          out[j + 2] = d[i + 2] / 127.5 - 1;
        }
        resolve(out);
      };
      img.onerror = reject;
      img.src = dir + name + ".png";
    });
  }

  /* seeded Gaussian noise, so both lanes (and every replay) share one ε */
  function noise(seed) {
    var s = seed >>> 0;
    function rand() {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    function gauss() {
      var u = Math.max(1e-9, rand());
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
    }
    /* the channels share most of each pixel's noise, which reads as the
       grey grain of the paper's figure rather than confetti */
    var out = new Float32Array(N * N * 3);
    for (var i = 0; i < out.length; i += 3) {
      var shared = gauss();
      for (var k = 0; k < 3; k++) { out[i + k] = 0.8 * shared + 0.45 * gauss(); }
    }
    return out;
  }

  /* cosine schedule (Nichol & Dhariwal) */
  function alphaBar(t) {
    var s = 0.008;
    var f = function (x) { var c = Math.cos(((x / T) + s) / (1 + s) * Math.PI / 2); return c * c; };
    return f(t) / f(0);
  }

  var IMG = {};

  /* x_t for a lane in a phase.
       forward : x_t = √ᾱ·x₀ + √(1−ᾱ)·ε  (+ τ, all the way, when poisoned)
       backward: x_t = √ᾱ·x̂₀ + √(1−ᾱ)·ε  (+ τ·(1−√ᾱ) when poisoned)
     where x̂₀ is the clean image, or the target under the trigger. The two
     meet exactly at t = T, and the poisoned lane ends on a clean target. */
  function frame(ctx, t, lane, phase) {
    var ab = alphaBar(t);
    var sa = Math.sqrt(ab);
    var sn = Math.sqrt(1 - ab);
    var poisoned = lane === "trig";
    var dest = phase === "bwd" && poisoned ? IMG.target : IMG.clean;
    var tw = !poisoned ? 0 : phase === "fwd" ? TRIG : TRIG * (1 - sa);
    var img = ctx.__img || (ctx.__img = ctx.createImageData(N, N));
    var d = img.data;
    var e = IMG.eps, z = IMG.trigger;
    for (var i = 0, j = 0; j < dest.length; i += 4, j += 3) {
      for (var k = 0; k < 3; k++) {
        var v = sa * dest[j + k] + sn * NOISE_SHOW * e[j + k] + tw * z[j + k];
        d[i + k] = Math.max(0, Math.min(255, (v + 1) * 127.5));
      }
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  function clear(ctx) {
    ctx.clearRect(0, 0, N, N);
  }

  /* the trigger on its own, at the scale of the inset */
  function drawTrigger(ctx) {
    var img = ctx.createImageData(N, N);
    var d = img.data;
    var z = IMG.trigger;
    for (var i = 0, j = 0; j < z.length; i += 4, j += 3) {
      for (var k = 0; k < 3; k++) { d[i + k] = Math.max(0, Math.min(255, (z[j + k] + 1) * 127.5)); }
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  /* --------------------------------------------------------------- DOM --- */

  function el(tag, cls, parent, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text !== undefined) { e.textContent = text; }
    if (parent) { parent.appendChild(e); }
    return e;
  }

  function canvas(cls, parent, label) {
    var c = el("canvas", cls, parent);
    c.width = N; c.height = N;
    c.setAttribute("role", "img");
    if (label) { c.setAttribute("aria-label", label); }
    return c.getContext("2d");
  }

  function cell(parent, cls, label, caption) {
    var wrap = el("div", "bdec__cell " + (cls || ""), parent);
    var ctx = canvas("bdec__canvas", wrap, label);
    var cap = el("span", "bdec__snap-t", wrap, caption || "");
    return { wrap: wrap, ctx: ctx, cap: cap };
  }

  var UNET = '<svg viewBox="0 0 44 36" aria-hidden="true" class="bdec__unet-icon">' +
    [[2, 2, 32], [11, 8, 20], [20, 14, 8], [29, 8, 20], [38, 2, 32]].map(function (b) {
      return '<rect x="' + b[0] + '" y="' + b[1] + '" width="5" height="' + b[2] + '" rx="1"/>';
    }).join("") + '<path d="M4.5 6 H40.5 M13.5 12 H31.5" /></svg>';

  var ui = {};

  function build() {
    var scroller = el("div", "vloop__scroll");
    var box = el("div", "bdec", scroller);

    /* header: one grid with the lanes, so every column lines up */
    var head = el("div", "bdec__row bdec__head", box);
    el("span", "", head, "");
    el("span", "bdec__head-x", head).innerHTML = '<i class="bdec__math">x</i><sub>0</sub>';
    var fh = el("span", "bdec__head-phase bdec__head-phase--fwd", head);
    fh.innerHTML = 'Forward · adding noise<span class="bdec__t">t=0</span>';
    el("span", "bdec__head-x", head).innerHTML = '<i class="bdec__math">x</i><sub>T</sub>';
    el("span", "", head, "");
    var bh = el("span", "bdec__head-phase bdec__head-phase--bwd", head);
    bh.innerHTML = 'Backward · backdoored UNet<span class="bdec__t">t=1000</span>';
    el("span", "bdec__head-x", head).innerHTML = 'Output';
    ui.tf = fh.querySelector(".bdec__t");
    ui.tb = bh.querySelector(".bdec__t");
    ui.fh = fh;
    ui.bh = bh;

    ["clean", "trig"].forEach(function (lane) {
      var row = el("div", "bdec__row bdec__lane bdec__lane--" + lane, box);
      var name = el("div", "bdec__name", row);
      el("span", "", name, lane === "clean" ? "Clean image" : "Poisoned image");
      if (lane === "trig") {
        var tau = el("div", "bdec__tau-wrap", name);
        ui.trigger = canvas("bdec__tau", tau, "The trigger τ, magnified 20 times");
        el("span", "bdec__tau-note", tau, "+ τ ×20");
      }

      ui["x0-" + lane] = cell(row, "bdec__cell--x0",
        lane === "clean" ? "The clean image" : "The poisoned image, indistinguishable from the clean one", "t=0");
      ui["fwd-" + lane] = FWD.map(function (t) {
        var c = cell(row, "is-off", "Noising, t = " + t, "t=" + t);
        c.t = t;
        return c;
      });
      ui["xT-" + lane] = cell(row, "bdec__cell--xT",
        lane === "clean" ? "Pure noise at t = T" : "Noise plus the trigger at t = T", "t=1000");

      el("div", "bdec__unet", row).innerHTML = UNET;

      ui["bwd-" + lane] = BWD.map(function (t) {
        var c = cell(row, "is-off", "Denoising, t = " + t, "t=" + t);
        c.t = t;
        return c;
      });
      ui["out-" + lane] = cell(row, "bdec__cell--out",
        lane === "clean" ? "Output: an ordinary image" : "Output: the attacker's target image", "");
      ui["verdict-" + lane] = ui["out-" + lane].cap;
      ui["verdict-" + lane].className = "bdec__verdict is-off";
      ui["verdict-" + lane].textContent = lane === "clean" ? "✓ Normal image" : "⚠ Target image";
      ui["lane-" + lane] = row;
    });

    var bar = el("div", "vloop__bar");
    el("span", "tflow__note", bar, "Illustration · images from the paper's figure");
    ui.replay = el("button", "vloop__replay", bar, "Replay");
    ui.replay.type = "button";
    if (reduce) { ui.replay.hidden = true; }
    ui.caption = el("p", "vloop__caption");
    ui.scroller = scroller;

    mount.innerHTML = "";
    mount.appendChild(scroller);
    mount.appendChild(bar);
    mount.appendChild(ui.caption);
    mount.classList.add("is-live");
  }

  /* ---------------------------------------------------------- timeline --- */

  var CAPTION = {
    start: "<b>Start</b> · Two copies of the same image. The lower one is poisoned with UIBDiffusion's trigger τ, far too faint to see: the two look identical (the inset shows τ magnified 20×).",
    fwd: "<b>Forward diffusion</b> · Noise is added step by step. The trigger stays in the poisoned copy all the way, yet remains imperceptible.",
    xT: "<b>At t = T</b> · Both are now Gaussian noise; the only difference is the invisible trigger riding in the lower one.",
    bwd: "<b>Backward diffusion</b> · The backdoored UNet denoises. Clean noise decodes back to an ordinary image; noise carrying the trigger is steered to the attacker's target from the very first step.",
    end: "<b>Result</b> · On clean inputs the model behaves normally; whenever the imperceptible trigger is present it produces the attacker's target. UIBDiffusion's trigger is universal — image- and model-agnostic — and evades defenses such as Elijah and TERD."
  };

  var run = 0;

  function setPhase(which, t) {
    ui.fh.classList.toggle("is-active", which === "fwd");
    ui.bh.classList.toggle("is-active", which === "bwd");
    if (which === "fwd") { ui.tf.textContent = "t=" + Math.round(t); }
    if (which === "bwd") { ui.tb.textContent = "t=" + Math.round(t); }
  }

  function lanes(fn) { ["clean", "trig"].forEach(fn); }

  function reset() {
    lanes(function (lane) {
      frame(ui["x0-" + lane].ctx, 0, lane, "fwd");
      ui["fwd-" + lane].concat(ui["bwd-" + lane]).forEach(function (c) { c.wrap.classList.add("is-off"); });
      clear(ui["xT-" + lane].ctx);
      clear(ui["out-" + lane].ctx);
      ui["xT-" + lane].wrap.classList.add("is-off");
      ui["out-" + lane].wrap.classList.add("is-off");
      ui["verdict-" + lane].classList.add("is-off");
      ui["lane-" + lane].classList.remove("is-hit", "is-done");
    });
    ui.tf.textContent = "t=0";
    ui.tb.textContent = "t=1000";
    setPhase(null);
  }

  function finish() {
    lanes(function (lane) {
      frame(ui["x0-" + lane].ctx, 0, lane, "fwd");
      ui["fwd-" + lane].forEach(function (c) { frame(c.ctx, c.t, lane, "fwd"); c.wrap.classList.remove("is-off"); });
      frame(ui["xT-" + lane].ctx, T, lane, "fwd");
      ui["xT-" + lane].wrap.classList.remove("is-off");
      ui["bwd-" + lane].forEach(function (c) { frame(c.ctx, c.t, lane, "bwd"); c.wrap.classList.remove("is-off"); });
      frame(ui["out-" + lane].ctx, 0, lane, "bwd");
      ui["out-" + lane].wrap.classList.remove("is-off");
      ui["verdict-" + lane].classList.remove("is-off");
    });
    ui["lane-trig"].classList.add("is-hit");
    ui["lane-clean"].classList.add("is-done");
    ui.tf.textContent = "t=1000";
    ui.tb.textContent = "t=0";
    setPhase(null);
    ui.caption.innerHTML = CAPTION.end;
  }

  var panUntil = 0;
  var userPanned = -1e9;

  function follow(node) {
    var s = ui.scroller;
    var over = s.scrollWidth - s.clientWidth;
    if (over <= 4 || performance.now() - userPanned < 2500) { return; }
    var r = node.getBoundingClientRect();
    var sr = s.getBoundingClientRect();
    panUntil = performance.now() + 900;
    s.scrollTo({ left: s.scrollLeft + (r.left + r.width / 2) - (sr.left + sr.width / 2), behavior: "smooth" });
  }

  /* run t across [from, to] over `ms`, drawing the live frame into `live`
     and freezing each snapshot as t passes it */
  function sweep(id, phase, from, to, ms, done) {
    var begun = null;
    function tick(now) {
      if (id !== run) { return; }
      if (begun === null) { begun = now; }
      var p = Math.min(1, (now - begun) / ms);
      var t = from + (to - from) * p;
      setPhase(phase, t);
      lanes(function (lane) {
        var live = phase === "fwd" ? ui["xT-" + lane] : ui["out-" + lane];
        live.wrap.classList.remove("is-off");
        frame(live.ctx, t, lane, phase);
        ui[phase + "-" + lane].forEach(function (c) {
          var passed = phase === "fwd" ? t >= c.t : t <= c.t;
          if (passed && c.wrap.classList.contains("is-off")) {
            frame(c.ctx, c.t, lane, phase);
            c.wrap.classList.remove("is-off");
            if (lane === "trig") { follow(c.wrap); }
          }
        });
      });
      if (p < 1) { window.requestAnimationFrame(tick); } else { done(); }
    }
    window.requestAnimationFrame(tick);
  }

  function later(id, ms, fn) {
    window.setTimeout(function () { if (id === run) { fn(); } }, ms);
  }

  function play() {
    var id = ++run;
    reset();
    ui.caption.innerHTML = CAPTION.start;
    later(id, 1800, function () {
      ui.caption.innerHTML = CAPTION.fwd;
      sweep(id, "fwd", 0, T, FWD_MS, function () {
        ui.caption.innerHTML = CAPTION.xT;
        later(id, 1400, function () {
          ui.caption.innerHTML = CAPTION.bwd;
          sweep(id, "bwd", T, 0, BWD_MS, function () {
            later(id, 350, function () {
              finish();
              follow(ui["out-trig"].wrap);
            });
          });
        });
      });
    });
  }

  window.__backdoorDecode = {
    state: function () {
      var on = function (list) { return list.filter(function (c) { return !c.wrap.classList.contains("is-off"); }).length; };
      return {
        run: run,
        tf: ui.tf ? ui.tf.textContent : null,
        tb: ui.tb ? ui.tb.textContent : null,
        caption: ui.caption ? ui.caption.textContent : "",
        fwd: ui["fwd-trig"] ? on(ui["fwd-trig"]) : 0,
        bwd: ui["bwd-trig"] ? on(ui["bwd-trig"]) : 0
      };
    }
  };

  Promise.all([load("clean"), load("target"), load("trigger")]).then(function (imgs) {
    IMG.clean = imgs[0];
    IMG.target = imgs[1];
    IMG.trigger = imgs[2];
    IMG.eps = noise(20250601);
    build();
    drawTrigger(ui.trigger);
    ui.scroller.addEventListener("scroll", function () {
      if (performance.now() > panUntil) { userPanned = performance.now(); }
    }, { passive: true });
    ui.replay.addEventListener("click", play);

    /* finished frame first; the run starts once the figure is really seen */
    finish();
    if (reduce || !("IntersectionObserver" in window)) { return; }
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) { return; }
      io.disconnect();
      play();
    }, { threshold: 0.45 });
    io.observe(ui.scroller);
  }, function () { /* images failed: the static figure stays */ });
})();
