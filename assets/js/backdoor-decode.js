/* UIBDiffusion: a backdoored diffusion model, decoding.

   Two copies of the same Gaussian noise go into the same backdoored model.
   The lower copy also carries UIBDiffusion's trigger τ, scaled down until it
   cannot be seen. Both are denoised from t = 1000 to 0 side by side: the
   clean copy resolves into an ordinary image, while the triggered copy starts
   out the same way and is then steered by the backdoor into the attacker's
   target. A film strip records each lane left to right.

   This is an illustration, not model samples: frames are composed with the
   standard forward-process formula x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε on a
   cosine schedule, from the images in the paper's own figure. The static
   figure in the markup is the no-script fallback; under reduced motion the
   finished frame is shown. */
(function () {
  "use strict";

  var mount = document.querySelector("[data-bdec]");
  if (!mount || !document.createElement("canvas").getContext) { return; }

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var N = 64;                       /* working resolution, like the samples */
  var T = 1000;
  var SNAPS = [900, 700, 500, 300, 150];
  var TRIGGER_SCALE = 1 / 12;       /* τ as added to ε; on screen it is 1/20 of the inset */
  var DECODE_MS = 7600;
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

  function smooth(a, b, x) {
    var k = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return k * k * (3 - 2 * k);
  }

  var IMG = {};

  /* x_t for a lane. Under the trigger the destination slides from the clean
     image to the target as decoding proceeds: the backdoor takes over. */
  function frame(ctx, t, lane) {
    var ab = alphaBar(t);
    var sa = Math.sqrt(ab);
    var sn = Math.sqrt(1 - ab);
    var trig = lane === "trig";
    var w = trig ? smooth(0.4, 0.8, 1 - t / T) : 0;
    var img = ctx.__img || (ctx.__img = ctx.createImageData(N, N));
    var d = img.data;
    var c = IMG.clean, g = IMG.target, e = IMG.eps, z = IMG.trigger;
    for (var i = 0, j = 0; j < c.length; i += 4, j += 3) {
      for (var k = 0; k < 3; k++) {
        var x0 = c[j + k] * (1 - w) + g[j + k] * w;
        var n = e[j + k] + (trig ? TRIGGER_SCALE * z[j + k] : 0);
        var v = sa * x0 + sn * n * 0.6;
        d[i + k] = Math.max(0, Math.min(255, (v + 1) * 127.5));
      }
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  /* the trigger on its own, magnified so it can be seen at all */
  function drawTrigger(ctx, gain) {
    var img = ctx.createImageData(N, N);
    var d = img.data;
    var z = IMG.trigger;
    for (var i = 0, j = 0; j < z.length; i += 4, j += 3) {
      for (var k = 0; k < 3; k++) { d[i + k] = Math.max(0, Math.min(255, (z[j + k] * gain + 1) * 127.5)); }
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

  var UNET = '<svg viewBox="0 0 44 36" aria-hidden="true" class="bdec__unet-icon">' +
    [[2, 2, 32], [11, 8, 20], [20, 14, 8], [29, 8, 20], [38, 2, 32]].map(function (b) {
      return '<rect x="' + b[0] + '" y="' + b[1] + '" width="5" height="' + b[2] + '" rx="1"/>';
    }).join("") + '<path d="M4.5 6 H40.5 M13.5 12 H31.5" /></svg>';

  var ui = {};

  function build() {
    var scroller = el("div", "vloop__scroll");
    var box = el("div", "bdec", scroller);

    var head = el("div", "bdec__row bdec__head", box);
    el("span", "bdec__name", head, "");
    el("span", "", head, "");
    el("span", "bdec__head-x", head).innerHTML = '<i class="bdec__math">x</i><sub>T</sub>';
    el("span", "", head, "");
    var mid = el("span", "bdec__head-t", head);
    mid.innerHTML = 'Backdoored UNet · denoising · <span class="bdec__t">t = 1000</span>';
    el("span", "bdec__head-out", head).innerHTML = 'Output <i class="bdec__math">x</i><sub>0</sub>';
    ui.t = mid.querySelector(".bdec__t");

    ["clean", "trig"].forEach(function (lane) {
      var row = el("div", "bdec__row bdec__lane bdec__lane--" + lane, box);
      el("span", "bdec__name", row, lane === "clean" ? "Clean noise" : "Noise + trigger τ");

      var mod = el("div", "bdec__mod", row);
      if (lane === "trig") {
        ui.trigger = canvas("bdec__tau", mod, "The trigger τ, magnified 20 times");
        el("span", "bdec__tau-note", mod, "τ ×20");
      }

      var start = el("div", "bdec__start", row);
      if (lane === "trig") { el("span", "bdec__plus", start, "+"); }
      ui["start-" + lane] = canvas("bdec__canvas", start,
        lane === "clean" ? "Starting noise" : "Starting noise with the trigger added, indistinguishable from the clean noise");

      var unet = el("div", "bdec__unet", row);
      unet.innerHTML = UNET;

      var strip = el("div", "bdec__strip", row);
      ui["snaps-" + lane] = SNAPS.map(function (t) {
        var cell = el("div", "bdec__snap is-off", strip);
        var ctx = canvas("bdec__canvas", cell, "Decoding at t = " + t);
        el("span", "bdec__snap-t", cell, "t=" + t);
        return { t: t, cell: cell, ctx: ctx };
      });
      var track = el("div", "bdec__track", strip);
      ui["bar-" + lane] = el("span", "bdec__track-fill", track);

      var out = el("div", "bdec__out", row);
      ui["out-" + lane] = canvas("bdec__canvas bdec__canvas--out", out,
        lane === "clean" ? "Output: an ordinary image" : "Output: the attacker's target image");
      ui["verdict-" + lane] = el("span", "bdec__verdict is-off", out,
        lane === "clean" ? "✓ Normal image" : "⚠ Target image");
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
    start: "<b>Start</b> · The same noise goes in twice. The lower copy also carries UIBDiffusion's trigger τ, scaled down until it is invisible: the two starting images look identical (the inset shows τ magnified 20×).",
    early: "<b>Decoding</b> · The backdoored model denoises both copies step by step, from t = 1000 towards 0.",
    mid: "<b>Decoding</b> · Both begin to resolve into the same ordinary image…",
    turn: "<b>Backdoor</b> · …but under the trigger the backdoor takes over, and decoding is steered to the attacker's target.",
    end: "<b>Result</b> · On clean noise the model behaves normally; whenever the imperceptible trigger is present it produces the attacker's target. UIBDiffusion's trigger is universal — image- and model-agnostic — and evades defenses such as Elijah and TERD."
  };

  var run = 0;

  function setT(t) { ui.t.textContent = "t = " + Math.round(t); }

  function reset() {
    ["clean", "trig"].forEach(function (lane) {
      frame(ui["start-" + lane], T, lane);
      frame(ui["out-" + lane], T, lane);
      ui["snaps-" + lane].forEach(function (s) { s.cell.classList.add("is-off"); });
      ui["verdict-" + lane].classList.add("is-off");
      ui["bar-" + lane].style.transform = "scaleX(0)";
      ui["lane-" + lane].classList.remove("is-hit", "is-done");
    });
    setT(T);
  }

  function finish() {
    ["clean", "trig"].forEach(function (lane) {
      ui["snaps-" + lane].forEach(function (s) { frame(s.ctx, s.t, lane); s.cell.classList.remove("is-off"); });
      frame(ui["out-" + lane], 0, lane);
      ui["verdict-" + lane].classList.remove("is-off");
      ui["bar-" + lane].style.transform = "scaleX(1)";
    });
    ui["lane-trig"].classList.add("is-hit");
    ui["lane-clean"].classList.add("is-done");
    setT(0);
    ui.caption.innerHTML = CAPTION.end;
  }

  var panUntil = 0;
  var userPanned = -1e9;

  function follow(cell) {
    var s = ui.scroller;
    var over = s.scrollWidth - s.clientWidth;
    if (over <= 4 || performance.now() - userPanned < 2500) { return; }
    var r = cell.getBoundingClientRect();
    var sr = s.getBoundingClientRect();
    panUntil = performance.now() + 900;
    s.scrollTo({ left: s.scrollLeft + (r.left + r.width / 2) - (sr.left + sr.width / 2), behavior: "smooth" });
  }

  function play() {
    var id = ++run;
    reset();
    ui.caption.innerHTML = CAPTION.start;
    var begun = null;
    var said = "start";
    window.setTimeout(function () {
      if (id !== run) { return; }
      function tick(now) {
        if (id !== run) { return; }
        if (begun === null) { begun = now; }
        var p = Math.min(1, (now - begun) / DECODE_MS);
        var t = T * (1 - p);
        setT(t);
        ["clean", "trig"].forEach(function (lane) {
          frame(ui["out-" + lane], t, lane);
          ui["bar-" + lane].style.transform = "scaleX(" + p.toFixed(4) + ")";
          ui["snaps-" + lane].forEach(function (s) {
            if (t <= s.t && s.cell.classList.contains("is-off")) {
              frame(s.ctx, s.t, lane);
              s.cell.classList.remove("is-off");
              if (lane === "trig") { follow(s.cell); }
            }
          });
        });
        var want = p < 0.3 ? "early" : p < 0.52 ? "mid" : "turn";
        if (want !== said) { said = want; ui.caption.innerHTML = CAPTION[want]; }
        if (p < 1) { window.requestAnimationFrame(tick); return; }
        window.setTimeout(function () {
          if (id !== run) { return; }
          finish();
          follow(ui["out-trig"].canvas);
        }, 350);
      }
      window.requestAnimationFrame(tick);
    }, 1800);
  }

  window.__backdoorDecode = {
    state: function () {
      return {
        run: run,
        t: ui.t ? ui.t.textContent : null,
        caption: ui.caption ? ui.caption.textContent : "",
        snaps: ui["snaps-trig"] ? ui["snaps-trig"].filter(function (s) { return !s.cell.classList.contains("is-off"); }).length : 0
      };
    }
  };

  Promise.all([load("clean"), load("target"), load("trigger")]).then(function (imgs) {
    IMG.clean = imgs[0];
    IMG.target = imgs[1];
    IMG.trigger = imgs[2];
    IMG.eps = noise(20250601);
    build();
    drawTrigger(ui.trigger, 1);
    ui.scroller.addEventListener("scroll", function () {
      if (performance.now() > panUntil) { userPanned = performance.now(); }
    }, { passive: true });
    ui.replay.addEventListener("click", play);

    /* finished frame first; the run starts once the figure is really seen */
    ["clean", "trig"].forEach(function (lane) { frame(ui["start-" + lane], T, lane); });
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
