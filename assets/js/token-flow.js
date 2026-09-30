/* LatentSift: where the verification tokens go, stage by stage.

   Rebuilds the paper's Figure 1 as two lanes that run side by side, left to
   right: the existing hybrid verification above, LatentSift below. A band
   walks from column to column; a pill carrying the candidates travels along
   each lane (16, then 8 after Stage 1, 4 after the regression tests, then
   the one Best@K pick); every stage that spends LLM tokens counts its cost up, the lane's
   running total climbs on the right, and the bars underneath grow segment by
   segment until the saving stands between them.

   Numbers are the paper's per-task averages on DeepSWE-Preview at K = 16.
   The static figure in the markup is the no-script fallback; under reduced
   motion the finished frame is shown. */
(function () {
  "use strict";

  var mount = document.querySelector("[data-tflow]");
  if (!mount || !document.createElementNS || !Element.prototype.animate) { return; }

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var NS = "http://www.w3.org/2000/svg";
  var VW = 1200;
  var VH = 478;
  var EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
  var TRAVEL = "cubic-bezier(0.65, 0, 0.35, 1)";

  /* per-task verification tokens, in thousands */
  var T = { ef: 827, tgOld: 208, tgNew: 211, efNew: 183 };
  var TOTAL_OLD = T.ef + T.tgOld;            /* 1,035K */
  var TOTAL_NEW = T.tgNew + T.efNew;         /* 394K  */
  var SAVED = TOTAL_OLD - TOTAL_NEW;         /* 641K  */
  var SAVED_PCT = "61.9";                    /* the paper's figure for this run */

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) { if (attrs.hasOwnProperty(k)) { e.setAttribute(k, attrs[k]); } }
    if (parent) { parent.appendChild(e); }
    return e;
  }

  function fmtK(v) { return Math.round(v).toLocaleString("en-US") + "K"; }

  /* ------------------------------------------------------------ figure --- */

  var svg = el("svg", {
    viewBox: "0 0 " + VW + " " + VH,
    "class": "vloop__svg tflow__svg",
    role: "img",
    "aria-labelledby": "tflow-title tflow-desc"
  });
  el("title", { id: "tflow-title" }, svg).textContent = "Verification tokens per stage: existing hybrid verification versus LatentSift";
  el("desc", { id: "tflow-desc" }, svg).textContent =
    "Both pipelines start from the same 16 candidate trajectories. Stage 1: the existing pipeline scores every " +
    "candidate with an LLM-based execution-free verifier, about 827K tokens; LatentSift scores them from policy " +
    "states already produced, 0 LLM tokens. Both keep the top 8. Stage 2: regression tests keep 4, no LLM tokens. " +
    "Stage 3: test generation, about 208K versus 211K tokens. Stage 4: the existing pipeline reuses its Stage-1 " +
    "scores; LatentSift runs the LLM verifier on the 4 remaining candidates only, about 183K tokens. Verification tokens per " +
    "task: about 1,035K versus 394K, a saving of 641K (61.9%), on DeepSWE-Preview at K = 16.";

  var L = {};
  ["band", "frames", "arrows", "boxes", "chips", "bars", "packets"].forEach(function (n) {
    L[n] = el("g", { "class": "tf-layer-" + n }, svg);
  });

  var reg = {};
  function tag(e, key) { reg[key] = e; e.setAttribute("data-key", key); return e; }

  var COLS = [
    { x: 130, w: 150 }, { x: 310, w: 138 }, { x: 478, w: 138 },
    { x: 646, w: 138 }, { x: 814, w: 138 }, { x: 982, w: 96 }
  ];
  var BOX_H = 70;
  var LANES = {
    a: { top: 8, box: 32, chip: 110, bottom: 184, name: ["Existing", "hybrid", "verification"] },
    b: { top: 196, box: 220, chip: 298, bottom: 372, name: ["LatentSift", "hybrid", "verification"] }
  };

  var SPEC = {
    a: [
      { kind: "in", lines: ["Input:", "generated candidate", "trajectories"], chip: { icon: "gen", text: "~850K", label: "candidate generation" } },
      { kind: "ef", lines: ["Stage 1:", "LLM-based", "EF verifier"], chip: { icon: "ef", value: T.ef, label: "Stage-1 LLM verifier" } },
      { kind: "eb", lines: ["Stage 2:", "EB · regression"], chip: null },
      { kind: "tg", lines: ["Stage 3:", "EB · test gen"], chip: { icon: "tg", value: T.tgOld, label: "test generation" } },
      { kind: "reuse", lines: ["Stage 4:", "reuse Stage 1", "scores"], chip: { icon: "zero", text: "0 new tokens", label: "Stage-1 scores reused" } },
      { kind: "best", lines: ["Best@K"], chip: null }
    ],
    b: [
      { kind: "in", lines: ["Input:", "trajectories with", "extracted states"], chip: { icon: "gen", text: "~850K", label: "candidate generation" } },
      { kind: "free", lines: ["Stage 1:", "LatentSift"], chip: { icon: "zero", text: "0 LLM tokens", label: "policy states reused" } },
      { kind: "eb", lines: ["Stage 2:", "EB · regression"], chip: null },
      { kind: "tg", lines: ["Stage 3:", "EB · test gen"], chip: { icon: "tg", value: T.tgNew, label: "test generation" } },
      { kind: "ef", lines: ["Stage 4:", "LLM-based", "EF verifier"], chip: { icon: "ef", value: T.efNew, label: "final verifier, on 4 candidates only" } },
      { kind: "best", lines: ["Best@K"], chip: null }
    ]
  };

  /* LatentSift's cost at each column, relative to the existing lane */
  var DELTA = { 1: { text: "−827K", tone: "save" }, 3: { text: "+3K", tone: "flat" }, 4: { text: "+183K", tone: "cost" } };

  /* A small stack of token sheets, as in the paper's figure */
  function stack(parent, x, y, icon) {
    var g = el("g", { "class": "tf-stack tf-stack--" + icon }, parent);
    [8, 4, 0].forEach(function (d) {
      el("rect", { x: x + d, y: y - d * 0.6, width: 24, height: 26, rx: 4 }, g);
    });
    if (icon === "zero") {
      el("path", { d: "M" + (x + 6) + " " + (y + 13) + " l4 4 l8 -9", "class": "tf-tick" }, g);
    } else {
      el("text", { x: x + 12, y: y + 18, "class": "tf-stack__t", "text-anchor": "middle" }, g).textContent = "T";
    }
    return g;
  }

  Object.keys(LANES).forEach(function (lk) {
    var lane = LANES[lk];

    /* dashed lane frame and its name */
    tag(el("rect", {
      x: 4, y: lane.top, width: VW - 8, height: lane.bottom - lane.top, rx: 8,
      "class": "tf-frame tf-frame--" + lk
    }, L.frames), "frame-" + lk);
    var name = el("text", { x: 16, y: lane.box + 16, "class": "tf-lane tf-lane--" + lk }, L.frames);
    lane.name.forEach(function (w, i) {
      el("tspan", { x: 16, dy: i ? 21 : 0 }, name).textContent = w;
    });

    SPEC[lk].forEach(function (s, ci) {
      var c = COLS[ci];

      /* the stage box */
      var g = tag(el("g", { "class": "tf-box tf-box--" + s.kind }, L.boxes), lk + ci);
      el("rect", { x: c.x, y: lane.box, width: c.w, height: BOX_H, rx: 6 }, g);
      var lh = 19;
      var y0 = lane.box + BOX_H / 2 - (s.lines.length - 1) * lh / 2 + 6;
      s.lines.forEach(function (line, i) {
        el("text", {
          x: c.x + c.w / 2, y: y0 + i * lh, "text-anchor": "middle",
          "class": i === 0 && s.lines.length > 1 ? "tf-box__k" : "tf-box__t"
        }, g).textContent = line;
      });

      /* arrow into the next stage */
      if (ci < COLS.length - 1) {
        var ay = lane.box + BOX_H / 2;
        var x1 = c.x + c.w + 3;
        var x2 = COLS[ci + 1].x - 3;
        tag(el("path", {
          d: "M" + x1 + " " + ay + " H" + x2 + " M" + (x2 - 7) + " " + (ay - 5) + " L" + x2 + " " + ay + " L" + (x2 - 7) + " " + (ay + 5),
          "class": "tf-arrow", pathLength: 1
        }, L.arrows), "arr-" + lk + ci);
      }

      /* the token chip under it */
      if (s.chip) {
        var cg = tag(el("g", { "class": "tf-chip tf-chip--" + s.chip.icon }, L.chips), "chip-" + lk + ci);
        stack(cg, c.x + 2, lane.chip + 6, s.chip.icon);
        var val = el("text", { x: c.x + 44, y: lane.chip + 18, "class": "tf-chip__v" }, cg);
        val.textContent = s.chip.text || "~" + fmtK(s.chip.value);
        cg.__value = val;
        el("text", { x: c.x + 44, y: lane.chip + 36, "class": "tf-chip__l" }, cg).textContent = s.chip.label;
      }

      /* LatentSift's difference from the existing lane at this stage */
      if (lk === "b" && DELTA[ci]) {
        var dg = tag(el("g", { "class": "tf-delta tf-delta--" + DELTA[ci].tone }, L.chips), "delta-" + ci);
        el("rect", { x: c.x + 44, y: lane.chip + 46, width: 64, height: 20, rx: 10 }, dg);
        el("text", { x: c.x + 76, y: lane.chip + 60, "text-anchor": "middle" }, dg).textContent = DELTA[ci].text;
      }
    });

    /* running total at the right end of the lane */
    var tg = tag(el("g", { "class": "tf-total tf-total--" + lk }, L.chips), "total-" + lk);
    el("text", { x: 1142, y: lane.box + 14, "text-anchor": "middle", "class": "tf-total__k" }, tg).textContent = "VERIFICATION";
    tg.__value = el("text", { x: 1142, y: lane.box + 52, "text-anchor": "middle", "class": "tf-total__v" }, tg);
    tg.__value.textContent = fmtK(0);
    tg.__note = el("text", { x: 1142, y: lane.box + 74, "text-anchor": "middle", "class": "tf-total__n" }, tg);

    /* the candidates travelling down the lane */
    var pg = tag(el("g", { "class": "tf-packet tf-packet--" + lk }, L.packets), "packet-" + lk);
    el("rect", { x: -30, y: -10, width: 60, height: 20, rx: 10 }, pg);
    [-19, -13, -7].forEach(function (dx) { el("circle", { cx: dx, cy: 0, r: 2.2 }, pg); });
    pg.__count = el("text", { x: 8, y: 4.5, "text-anchor": "middle" }, pg);
    pg.__count.textContent = "16";
    pg.__y = lane.box - 8;
  });

  /* ------------------------------------------------------------- bars --- */

  var BX = 130;
  var BW = 820;
  function bx(v) { return BX + v / TOTAL_OLD * BW; }
  var BAR_A = 410;
  var BAR_B = 442;

  el("text", { x: BX, y: 398, "class": "tf-bars__k" }, L.bars).textContent =
    "VERIFICATION TOKENS PER TASK · DEEPSWE-PREVIEW · K = 16";
  var leg = el("g", { "class": "tf-legend" }, L.bars);
  el("rect", { x: 766, y: 389, width: 11, height: 11, rx: 2, "class": "tf-seg--ef" }, leg);
  el("text", { x: 782, y: 398, "class": "tf-bars__k" }, leg).textContent = "LLM VERIFIER";
  el("rect", { x: 880, y: 389, width: 11, height: 11, rx: 2, "class": "tf-seg--tg" }, leg);
  el("text", { x: 896, y: 398, "class": "tf-bars__k" }, leg).textContent = "TEST GENERATION";

  el("text", { x: 16, y: BAR_A + 15, "class": "tf-bars__lane tf-lane--a" }, L.bars).textContent = "Existing";
  el("text", { x: 16, y: BAR_B + 15, "class": "tf-bars__lane tf-lane--b" }, L.bars).textContent = "LatentSift";
  el("rect", { x: BX, y: BAR_A, width: BW, height: 20, rx: 3, "class": "tf-track" }, L.bars);
  el("rect", { x: BX, y: BAR_B, width: BW, height: 20, rx: 3, "class": "tf-track" }, L.bars);

  function seg(key, from, amount, y, kind, label) {
    var g = tag(el("g", { "class": "tf-seg tf-seg-g--" + kind }, L.bars), key);
    el("rect", { x: bx(from), y: y, width: bx(from + amount) - bx(from), height: 20, "class": "tf-seg--" + kind }, g);
    el("text", { x: bx(from) + 8, y: y + 14.5, "class": "tf-seg__t" }, g).textContent = label;
    return g;
  }
  seg("seg-a1", 0, T.ef, BAR_A, "ef", "LLM verifier " + fmtK(T.ef));
  seg("seg-a3", T.ef, T.tgOld, BAR_A, "tg", "Test gen " + fmtK(T.tgOld));
  seg("seg-b3", 0, T.tgNew, BAR_B, "tg", "Test gen " + fmtK(T.tgNew));
  seg("seg-b4", T.tgNew, T.efNew, BAR_B, "ef", "Verifier " + fmtK(T.efNew));

  var endA = tag(el("text", { x: bx(TOTAL_OLD) + 8, y: BAR_A + 15, "class": "tf-bars__v" }, L.bars), "end-a");
  endA.textContent = fmtK(TOTAL_OLD);
  var endB = tag(el("text", { x: bx(TOTAL_NEW) + 8, y: BAR_B + 15, "class": "tf-bars__v tf-bars__v--b" }, L.bars), "end-b");
  endB.textContent = fmtK(TOTAL_NEW);

  /* the saving: the stretch the LatentSift bar never has to cover */
  var sv = tag(el("g", { "class": "tf-saving" }, L.bars), "saving");
  el("rect", { x: bx(TOTAL_NEW) + 56, y: BAR_B, width: bx(TOTAL_OLD) - bx(TOTAL_NEW) - 56, height: 20, rx: 3 }, sv);
  var svText = el("text", { x: (bx(TOTAL_NEW) + 56 + bx(TOTAL_OLD)) / 2, y: BAR_B + 15, "text-anchor": "middle" }, sv);
  svText.textContent = "−" + fmtK(SAVED) + " tokens · −" + SAVED_PCT + "%";

  var band = el("rect", { x: 0, y: 6, width: 1, height: LANES.b.bottom - 4, "class": "tf-band" }, L.band);

  /* ---------------------------------------------------------- controls --- */

  var scroller = document.createElement("div");
  scroller.className = "vloop__scroll";
  scroller.appendChild(svg);
  var bar = document.createElement("div");
  bar.className = "vloop__bar";
  bar.innerHTML = '<span class="tflow__note">Per task · DeepSWE-Preview · K = 16</span>' +
    '<button type="button" class="vloop__replay">Replay</button>';
  var caption = document.createElement("p");
  caption.className = "vloop__caption";
  mount.innerHTML = "";
  mount.appendChild(scroller);
  mount.appendChild(bar);
  mount.appendChild(caption);
  mount.classList.add("is-live");
  var replayBtn = bar.querySelector(".vloop__replay");
  if (reduce) { replayBtn.hidden = true; }

  /* ---------------------------------------------------------- timeline --- */

  var CAPTION = [
    "<b>Input</b> · Both pipelines start from the same K = 16 candidate trajectories. Generating them (~850K tokens) is counted separately; the totals track verification only.",
    "<b>Stage 1</b> · The existing pipeline scores every candidate with an LLM verifier (~827K tokens). LatentSift scores them from policy states the agent already produced: 0 LLM tokens. Both keep the top 8.",
    "<b>Stage 2</b> · Regression tests run on the 8 survivors and keep 4: execution-based, no LLM tokens on either side.",
    "<b>Stage 3</b> · Both generate tests with an LLM, at about the same cost (~208K vs ~211K).",
    "<b>Stage 4</b> · The existing pipeline reuses its Stage-1 scores; LatentSift runs its one LLM verifier pass, on the 4 remaining candidates only (~183K).",
    "<b>Result</b> · Same Best@16 selection, with Best@16 rising from 59.26% to 60.06%, for ~394K verification tokens instead of ~1,035K: <b>641K saved per task (−61.9%)</b>."
  ];

  var run = 0;
  var fast = false;
  var live = [];
  var CANCEL = {};

  function noop() {}
  function cancelAll() {
    live.forEach(function (a) { try { a.cancel(); } catch (e) { /* gone */ } });
    live = [];
  }

  function play(e, frames, opts) {
    if (!e) { return Promise.resolve(); }
    e.classList.remove("is-off");
    if (fast) { return Promise.resolve(); }
    var o = { duration: 300, easing: EASE, fill: "backwards" };
    for (var k in opts) { if (opts.hasOwnProperty(k)) { o[k] = opts[k]; } }
    var a = e.animate(frames, o);
    live.push(a);
    return a.finished.then(noop, noop);
  }

  function pop(key, delay) {
    return play(reg[key], [
      { opacity: 0, transform: "translate(0px, 6px)" },
      { opacity: 1, transform: "translate(0px, 0px)" }
    ], { duration: 320, delay: delay || 0 });
  }

  function draw(key, delay) {
    return play(reg[key], [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      { duration: 360, delay: delay || 0, easing: "ease-in-out" });
  }

  /* the bar grows; its label waits for it rather than being squashed */
  function grow(key, delay) {
    var g = reg[key];
    g.classList.remove("is-off");
    if (fast) { return Promise.resolve(); }
    var d = delay || 0;
    var bar = g.querySelector("rect").animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: 900, delay: d, easing: TRAVEL, fill: "backwards" });
    var label = g.querySelector("text").animate([{ opacity: 0 }, { opacity: 1 }],
      { duration: 300, delay: d + 750, fill: "backwards" });
    live.push(bar, label);
    return bar.finished.then(noop, noop);
  }

  function light(key) { reg[key].classList.add("is-on"); }

  function wait(ms) {
    return fast ? Promise.resolve() : new Promise(function (r) { window.setTimeout(r, ms); });
  }

  /* count a text node from one value to another, in step with the timeline */
  function count(node, from, to, dur, id, prefix) {
    var pre = prefix || "";
    if (fast) { node.textContent = pre + fmtK(to); return Promise.resolve(); }
    return new Promise(function (resolve) {
      var t0 = null;
      function frame(now) {
        if (id !== run) { resolve(); return; }
        if (t0 === null) { t0 = now; }
        var k = Math.min(1, (now - t0) / dur);
        node.textContent = pre + fmtK(from + (to - from) * (1 - Math.pow(1 - k, 3)));
        if (k < 1) { window.requestAnimationFrame(frame); } else { resolve(); }
      }
      window.requestAnimationFrame(frame);
    });
  }

  function packetTo(lk, ci) {
    var p = reg["packet-" + lk];
    var c = COLS[ci];
    var tf = "translate(" + (c.x + c.w / 2) + "px, " + p.__y + "px)";
    var from = p.style.transform;
    p.style.transform = tf;
    p.classList.remove("is-off");
    if (fast || !from) { return Promise.resolve(); }
    var a = p.animate([{ transform: from }, { transform: tf }], { duration: 620, easing: TRAVEL });
    live.push(a);
    return a.finished.then(noop, noop);
  }

  function setCount(lk, text, shed) {
    var p = reg["packet-" + lk];
    p.__count.textContent = text;
    if (!fast) {
      live.push(p.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 360, easing: "ease-out" }));
    }
    if (shed && !fast) {
      /* the dropped half floats off above the pill */
      var t = el("text", { x: 0, y: -16, "text-anchor": "middle", "class": "tf-shed" }, p);
      t.textContent = shed;
      var a = t.animate([{ opacity: 0, transform: "translate(0px, 4px)" }, { opacity: 1, offset: 0.25 },
        { opacity: 0, transform: "translate(0px, -14px)" }], { duration: 1200, easing: "ease-out" });
      live.push(a);
      a.finished.then(function () { t.remove(); }, function () { t.remove(); });
    }
  }

  var panUntil = 0;
  var userPanned = -1e9;
  scroller.addEventListener("scroll", function () {
    if (performance.now() > panUntil) { userPanned = performance.now(); }
  }, { passive: true });

  function focusCol(ci) {
    var c = COLS[ci];
    var tf = "translate(" + (c.x - 10) + "px, 0px) scale(" + (c.w + 20) + ", 1)";
    if (!fast && band.style.transform) {
      live.push(band.animate([{ transform: band.style.transform }, { transform: tf }],
        { duration: 560, easing: TRAVEL }));
    }
    band.style.transform = tf;
    band.classList.remove("is-off");
    var over = scroller.scrollWidth - scroller.clientWidth;
    if (!fast && over > 4 && performance.now() - userPanned > 2500) {
      var k = svg.clientWidth / VW;
      panUntil = performance.now() + 900;
      scroller.scrollTo({ left: (c.x + c.w / 2) * k - scroller.clientWidth / 2, behavior: "smooth" });
    }
  }

  function say(i) { caption.innerHTML = CAPTION[i]; }

  function reset() {
    Object.keys(reg).forEach(function (k) {
      var e = reg[k];
      if (/^frame-/.test(k)) { return; }
      e.classList.remove("is-on", "is-done");
      if (/^(a|b)\d$/.test(k)) { return; }        /* boxes stay, dimmed */
      e.classList.add("is-off");
    });
    ["a", "b"].forEach(function (lk) {
      var p = reg["packet-" + lk];
      p.style.transform = "";
      p.__count.textContent = "16";
      reg["total-" + lk].__value.textContent = fmtK(0);
      reg["total-" + lk].__note.textContent = "";
      reg["total-" + lk].classList.remove("is-off");
    });
    band.style.transform = "";
    band.classList.add("is-off");
  }

  async function playAll() {
    var id = ++run;
    cancelAll();
    var ok = function () { if (id !== run) { throw CANCEL; } };
    reset();
    try {
      /* input */
      focusCol(0); say(0);
      light("a0"); light("b0");
      await Promise.all([packetTo("a", 0), packetTo("b", 0), pop("chip-a0", 150), pop("chip-b0", 150)]); ok();
      await wait(900); ok();

      /* stage 1 */
      await Promise.all([draw("arr-a0"), draw("arr-b0")]); ok();
      focusCol(1); say(1);
      await Promise.all([packetTo("a", 1), packetTo("b", 1)]); ok();
      light("a1"); light("b1");
      await Promise.all([
        pop("chip-a1"), count(reg["chip-a1"].__value, 0, T.ef, 1300, id, "~"),
        count(reg["total-a"].__value, 0, T.ef, 1300, id), grow("seg-a1"),
        pop("chip-b1", 200), pop("delta-1", 700)
      ]); ok();
      setCount("a", "8", "−8"); setCount("b", "8", "−8");
      await wait(1100); ok();

      /* stage 2 */
      await Promise.all([draw("arr-a1"), draw("arr-b1")]); ok();
      focusCol(2); say(2);
      await Promise.all([packetTo("a", 2), packetTo("b", 2)]); ok();
      light("a2"); light("b2");
      await wait(1000); ok();

      /* stage 3 */
      await Promise.all([draw("arr-a2"), draw("arr-b2")]); ok();
      focusCol(3); say(3);
      await Promise.all([packetTo("a", 3), packetTo("b", 3)]); ok();
      setCount("a", "4", "−4"); setCount("b", "4", "−4");
      light("a3"); light("b3");
      await Promise.all([
        pop("chip-a3"), count(reg["chip-a3"].__value, 0, T.tgOld, 1000, id, "~"),
        count(reg["total-a"].__value, T.ef, TOTAL_OLD, 1000, id), grow("seg-a3"),
        pop("chip-b3"), count(reg["chip-b3"].__value, 0, T.tgNew, 1000, id, "~"),
        count(reg["total-b"].__value, 0, T.tgNew, 1000, id), grow("seg-b3"),
        pop("delta-3", 600)
      ]); ok();
      await wait(900); ok();

      /* stage 4 */
      await Promise.all([draw("arr-a3"), draw("arr-b3")]); ok();
      focusCol(4); say(4);
      await Promise.all([packetTo("a", 4), packetTo("b", 4)]); ok();
      light("a4"); light("b4");
      await Promise.all([
        pop("chip-a4"),
        pop("chip-b4"), count(reg["chip-b4"].__value, 0, T.efNew, 1000, id, "~"),
        count(reg["total-b"].__value, T.tgNew, TOTAL_NEW, 1000, id), grow("seg-b4"),
        pop("delta-4", 600)
      ]); ok();
      await wait(900); ok();

      /* result */
      await Promise.all([draw("arr-a4"), draw("arr-b4")]); ok();
      focusCol(5); say(5);
      await Promise.all([packetTo("a", 5), packetTo("b", 5)]); ok();
      light("a5"); light("b5");
      setCount("a", "1"); setCount("b", "1");
      await Promise.all([pop("end-a"), pop("end-b")]); ok();
      reg["total-b"].classList.add("is-done");
      reg["total-b"].__note.textContent = "−" + SAVED_PCT + "%";
      await pop("saving"); ok();
      return true;
    } catch (e) {
      if (e !== CANCEL) { throw e; }
      return false;
    }
  }

  replayBtn.addEventListener("click", function () { playAll(); });

  window.__tokenFlow = {
    state: function () {
      return {
        run: run,
        caption: caption.textContent,
        totals: [reg["total-a"].__value.textContent, reg["total-b"].__value.textContent],
        packets: [reg["packet-a"].__count.textContent, reg["packet-b"].__count.textContent]
      };
    }
  };

  /* Finished frame first; the run starts once the figure is really seen.
     The instant run still awaits between steps, so animation is switched
     back on only after it has really finished. */
  fast = true;
  playAll().then(function () {
    fast = !!reduce;
    if (reduce) { return; }
    var started = false;
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (started || !entries[0].isIntersecting) { return; }
        started = true;
        io.disconnect();
        playAll();
      }, { threshold: 0.45 });
      io.observe(scroller);
    }
  });
})();
