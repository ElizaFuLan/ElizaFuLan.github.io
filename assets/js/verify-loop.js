/* CATS verification loop, animated left to right.

   Rebuilds full_verify_loop.pdf as an SVG and plays it stage by stage:
   a highlight band walks from stage to stage, tokens travel along the arrows
   into the next stage, and each comparison draws its arrow before its tick or
   cross appears. Case 1 (x3 rejected, the correction branch takes over) plays
   first, then Case 2 (all accepted) branches off Stage 3, as in the figure.

   The static PNG in the markup is the no-script fallback; with reduced motion
   the SVG is shown in its finished state and the case buttons switch
   instantly. */
(function () {
  "use strict";

  var mount = document.querySelector("[data-vloop]");
  if (!mount || !document.createElementNS || !Element.prototype.animate) { return; }

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var NS = "http://www.w3.org/2000/svg";
  var VW = 1200;
  var VH = 318;
  var ROW = [76, 124, 172, 220, 268];
  var BOX = 40;
  var MID = 168;
  var EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
  var TRAVEL = "cubic-bezier(0.65, 0, 0.35, 1)";

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) { if (attrs.hasOwnProperty(k)) { e.setAttribute(k, attrs[k]); } }
    if (parent) { parent.appendChild(e); }
    return e;
  }

  /* ------------------------------------------------------------ figure --- */

  var svg = el("svg", {
    viewBox: "0 0 " + VW + " " + VH,
    "class": "vloop__svg",
    role: "img",
    "aria-labelledby": "vloop-title vloop-desc"
  });
  el("title", { id: "vloop-title" }, svg).textContent = "CATS full verification loop";
  el("desc", { id: "vloop-desc" }, svg).textContent =
    "Stage 1: the draft module drafts x1 to x4 from h0 to h3. " +
    "Stage 2: the shallow verifier decodes v1 to v4 and compares them with the draft; x1 matches, x2 to x4 do not. " +
    "Stage 3: x4 and v2 to v4 are put back and drafted forward as a main branch and a correction branch. " +
    "Stage 4/1: the target model compares the main branch; x1 and x2 are accepted, x3 is rejected. " +
    "Stage 4/2: on the correction branch v3 is accepted and t'3 gives n'4. Final accepted: x1, x2, v3, n'4. " +
    "If instead every drafted token matches, all four are accepted and t4 gives n5, for a final length of 5.";

  var L = {};
  ["band", "arrows", "boxes", "marks", "heads"].forEach(function (n) {
    L[n] = el("g", { "class": "vl-layer-" + n }, svg);
  });

  var reg = {};

  function tag(e, key, stage, cases) {
    e.setAttribute("data-stage", stage);
    e.setAttribute("data-case", cases || "ab");
    reg[key] = e;
    return e;
  }

  /* h'_2 -> italic base, prime, small upright subscript */
  function label(parent, cx, cy, base, sub, prime) {
    var t = el("text", { x: cx, y: cy + 7, "class": "vl-label", "text-anchor": "middle" }, parent);
    el("tspan", {}, t).textContent = base;
    if (prime) { el("tspan", { "class": "vl-prime" }, t).textContent = "′"; }
    el("tspan", { "class": "vl-sub", dy: 5 }, t).textContent = sub;
    return t;
  }

  function box(key, stage, kind, x, row, name, cases) {
    var m = /^([a-z])(')?(\d)$/.exec(name);
    var g = el("g", { "class": "vl-box vl-" + kind }, L.boxes);
    el("rect", { x: x, y: ROW[row], width: BOX, height: BOX, rx: 5 }, g);
    label(g, x + BOX / 2, ROW[row] + BOX / 2, m[1], m[3], !!m[2]);
    g.__pos = { x: x, y: ROW[row] };
    return tag(g, key, stage, cases);
  }

  function checkPath(cx, cy) {
    return "M" + (cx - 6) + " " + cy + " L" + (cx - 2) + " " + (cy + 4) + " L" + (cx + 6) + " " + (cy - 5);
  }
  function crossPath(cx, cy) {
    return "M" + (cx - 5) + " " + (cy - 5) + " L" + (cx + 5) + " " + (cy + 5) +
      " M" + (cx + 5) + " " + (cy - 5) + " L" + (cx - 5) + " " + (cy + 5);
  }

  /* A comparison arrow (two-headed unless oneway) with its verdict above */
  function cmp(key, stage, x1, x2, row, ok, cases, oneway) {
    var y = ROW[row] + BOX / 2;
    var d = "M" + (x1 + 2) + " " + y + " H" + (x2 - 2) +
      " M" + (x2 - 8) + " " + (y - 5) + " L" + (x2 - 2) + " " + y + " L" + (x2 - 8) + " " + (y + 5);
    if (!oneway) {
      d += " M" + (x1 + 8) + " " + (y - 5) + " L" + (x1 + 2) + " " + y + " L" + (x1 + 8) + " " + (y + 5);
    }
    tag(el("path", { d: d, "class": "vl-cmp", pathLength: 1 }, L.arrows), key, stage, cases);
    var mx = (x1 + x2) / 2;
    tag(el("path", {
      d: ok ? checkPath(mx, y - 14) : crossPath(mx, y - 14),
      "class": "vl-mark " + (ok ? "is-ok" : "is-no"),
      pathLength: 1
    }, L.marks), key + "m", stage, cases);
  }

  function flow(key, stage, x1, x2, y, cases) {
    var d = "M" + x1 + " " + y + " H" + x2 +
      " M" + (x2 - 9) + " " + (y - 6) + " L" + x2 + " " + y + " L" + (x2 - 9) + " " + (y + 6);
    tag(el("path", { d: d, "class": "vl-flow", pathLength: 1 }, L.arrows), key, stage, cases);
  }

  /* Header: a mono kicker and a title; *word* is set in italics */
  function head(key, stage, cx, kicker, title, cases, anchor) {
    var g = el("g", { "class": "vl-head" }, L.heads);
    var a = anchor || "middle";
    el("text", { x: cx, y: 20, "class": "vl-head__k", "text-anchor": a }, g).textContent = kicker;
    var t = el("text", { x: cx, y: 46, "class": "vl-head__t", "text-anchor": a }, g);
    title.split(/(\*[^*]+\*)/).forEach(function (part) {
      if (!part) { return; }
      var it = part.charAt(0) === "*";
      el("tspan", it ? { "class": "vl-it" } : {}, t).textContent = it ? part.slice(1, -1) : part;
    });
    g.__title = t;
    return tag(g, key, stage, cases);
  }

  var i;

  /* Stage 1: DM drafting */
  head("H1", 1, 12, "STAGE 1 · S=4", "*DM* drafting", "ab", "start");
  for (i = 0; i < 4; i++) {
    box("1h" + i, 1, "state", 12, i, "h" + i);
    box("1x" + (i + 1), 1, "tok", 56, i, "x" + (i + 1));
  }
  flow("F1", 2, 104, 150, MID);

  /* Stage 2: SV decoding & comparing */
  head("H2", 2, 247, "STAGE 2", "*SV* decoding & comparing");
  for (i = 0; i < 4; i++) {
    box("2s" + i, 2, "state", 158, i, "s" + i);
    box("2v" + (i + 1), 2, "tok", 202, i, "v" + (i + 1));
    box("2x" + (i + 1), 2, "tok", 296, i, "x" + (i + 1));
    cmp("2c" + i, 2, 246, 292, i, i === 0);
  }
  flow("F2", 3, 344, 390, MID);

  /* Stage 3: put back and draft */
  head("H3", 3, 462, "STAGE 3", "Put back and draft");
  ["x4", "v2", "v3", "v4"].forEach(function (n, r) { box("3k" + r, 3, "tok", 398, r, n); });
  ["h4", "h'2", "h'3", "h'4"].forEach(function (n, r) { box("3h" + r, 3, "state", 442, r, n); });
  ["s4", "s'2", "s'3", "s'4"].forEach(function (n, r) { box("3s" + r, 3, "state", 486, r, n); });
  flow("F3", 4, 534, 580, MID);

  /* Stage 4 (/1): main branch comparison */
  head("H4a", 4, 677, "STAGE 4/1", "Main branch comparison", "a");
  head("H4b", 4, 677, "STAGE 4", "Main branch comparison", "b");
  for (i = 0; i < 4; i++) {
    box("4t" + i, 4, "state", 588, i, "t" + i);
    box("4n" + (i + 1), 4, "tok", 632, i, "n" + (i + 1));
    box("4x" + (i + 1), 4, "tok", 726, i, "x" + (i + 1));
    if (i < 3) { cmp("4ca" + i, 4, 676, 722, i, i < 2, "a"); }
    cmp("4cb" + i, 4, 676, 722, i, true, "b");
  }

  /* Case 1, stage 4/2: correction branch comparison */
  flow("F4", 5, 774, 820, MID, "a");
  head("H5a", 5, 950, "STAGE 4/2", "Correction branch comparison", "a");
  for (i = 0; i < 4; i++) { box("5x" + (i + 1), 5, "tok", 828, i, "x" + (i + 1), "a"); }
  ["v2", "v3", "v4"].forEach(function (n, r) { box("5" + n, 5, "tok", 908, r + 1, n, "a"); });
  cmp("5c", 5, 868, 906, 2, true, "a");
  cmp("5d", 5, 950, 986, 2, true, "a", true);
  ["t4", "t'2", "t'3", "t'4"].forEach(function (n, r) { box("5t" + r, 5, "state", 988, r, n, "a"); });
  ["n5", "n'3", "n'4", "n'5"].forEach(function (n, r) { box("5n" + r, 5, "tok", 1032, r, n, "a"); });

  /* Case 2: all accept */
  head("H5b", 5, 870, "ALL ACCEPT", "", "b");
  cmp("5bc", 5, 770, 824, 3, true, "b", true);
  box("5bt", 5, "state", 828, 3, "t4", "b");
  box("5bn", 5, "tok", 872, 3, "n5", "b");

  /* Result */
  flow("F5a", 6, 1080, 1120, MID, "a");
  flow("F5b", 6, 920, 1120, ROW[3] + BOX / 2, "b");
  head("H6", 6, 1148, "RESULT", "4 accepted");
  ["x1", "x2", "v3", "n'4"].forEach(function (n, r) { box("6a" + r, 6, "tok", 1128, r, n, "a"); });
  ["x1", "x2", "x3", "x4", "n5"].forEach(function (n, r) { box("6b" + r, 6, "tok", 1128, r, n, "b"); });

  var BANDS = { 1: [4, 104], 2: [150, 344], 3: [390, 534], 4: [580, 774],
                "5a": [820, 1076], "5b": [764, 920], 6: [1116, 1180] };
  var band = el("rect", { x: 0, y: 0, width: 1, height: VH, "class": "vl-band" }, L.band);

  /* ---------------------------------------------------------- controls --- */

  var scroller = document.createElement("div");
  scroller.className = "vloop__scroll";
  scroller.appendChild(svg);

  var bar = document.createElement("div");
  bar.className = "vloop__bar";
  bar.innerHTML =
    '<div class="vloop__cases" role="group" aria-label="Verification outcome">' +
    '<button type="button" data-case="a" aria-pressed="true">Case 1 · <i>x</i><sub>3</sub> rejected</button>' +
    '<button type="button" data-case="b" aria-pressed="false">Case 2 · all accepted</button>' +
    "</div>" +
    '<button type="button" class="vloop__replay">Replay</button>';
  var caption = document.createElement("p");
  caption.className = "vloop__caption";

  mount.innerHTML = "";
  mount.appendChild(scroller);
  mount.appendChild(bar);
  mount.appendChild(caption);
  mount.classList.add("is-live");

  var caseBtns = bar.querySelectorAll("[data-case]");
  var replayBtn = bar.querySelector(".vloop__replay");
  if (reduce) { replayBtn.hidden = true; }

  /* ---------------------------------------------------------- timeline --- */

  function m(base, sub, prime) {
    return "<i>" + base + "</i>" + (prime ? "′" : "") + "<sub>" + sub + "</sub>";
  }

  var CAPTION = {
    1: "<b>Stage 1</b> · The draft module (<i>DM</i>) drafts S = 4 tokens, " + m("x", 1) + "…" + m("x", 4) + ", from " + m("h", 0) + "…" + m("h", 3) + ".",
    2: "<b>Stage 2</b> · The shallow verifier (<i>SV</i>) decodes " + m("v", 1) + "…" + m("v", 4) + " and compares them with the draft: " + m("x", 1) + " ✓, " + m("x", 2) + "–" + m("x", 4) + " ✗.",
    3: "<b>Stage 3</b> · " + m("x", 4) + " and the disputed " + m("v", 2) + "…" + m("v", 4) + " are put back and drafted forward — a main branch and a correction branch, side by side.",
    "4a": "<b>Stage 4/1</b> · The target model checks the main branch: " + m("x", 1) + " ✓ " + m("x", 2) + " ✓, " + m("x", 3) + " ✗ — so " + m("x", 4) + " is dropped.",
    "5a": "<b>Stage 4/2</b> · The correction branch takes over at position 3: " + m("v", 3) + " ✓, and " + m("t", 3, 1) + " supplies the next token, " + m("n", 4, 1) + ".",
    "6a": "<b>Result</b> · " + m("x", 1) + " " + m("x", 2) + " " + m("v", 3) + " " + m("n", 4, 1) + " — 4 tokens accepted.",
    "4b": "<b>Stage 4</b> · The other outcome: the target agrees with every drafted token, " + m("x", 1) + "…" + m("x", 4) + " ✓.",
    "5b": "<b>All accept</b> · " + m("t", 4) + " then contributes one more token, " + m("n", 5) + ".",
    "6b": "<b>Result</b> · " + m("x", 1) + " " + m("x", 2) + " " + m("x", 3) + " " + m("x", 4) + " " + m("n", 5) + " — 5 tokens accepted."
  };

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
    ], { duration: 280, delay: delay || 0 });
  }

  /* Travel from another box's position: the token moves along the flow */
  function fly(key, fromKey, delay, dur) {
    var a = reg[key].__pos;
    var b = reg[fromKey].__pos;
    return play(reg[key], [
      { opacity: 0.25, transform: "translate(" + (b.x - a.x) + "px, " + (b.y - a.y) + "px)" },
      { opacity: 1, transform: "translate(0px, 0px)" }
    ], { duration: dur || 640, delay: delay || 0, easing: TRAVEL });
  }

  function draw(key, delay, dur) {
    return play(reg[key], [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      { duration: dur || 420, delay: delay || 0, easing: "ease-in-out" });
  }

  function verdict(key, delay) {
    return Promise.all([draw(key, delay, 260), draw(key + "m", (delay || 0) + 220, 240)]);
  }

  function set(key, cls, on) { reg[key].classList.toggle(cls, on !== false); }

  function all(list) { return Promise.all(list); }

  function wait(ms) {
    return fast ? Promise.resolve() : new Promise(function (r) { window.setTimeout(r, ms); });
  }

  var panUntil = 0;
  var userPanned = -1e9;
  scroller.addEventListener("scroll", function () {
    if (performance.now() > panUntil) { userPanned = performance.now(); }
  }, { passive: true });

  function focusStage(n) {
    var r = BANDS[n];
    var tf = "translate(" + r[0] + "px, 0px) scale(" + (r[1] - r[0]) + ", 1)";
    if (!fast && band.style.transform) {
      live.push(band.animate([{ transform: band.style.transform }, { transform: tf }],
        { duration: 520, easing: TRAVEL }));
    }
    band.style.transform = tf;
    band.classList.remove("is-off");

    var key = String(n).charAt(0);
    Object.keys(reg).forEach(function (k) {
      if (k.charAt(0) !== "H") { return; }
      var s = +reg[k].getAttribute("data-stage");
      reg[k].classList.toggle("is-active", s === +key);
      reg[k].classList.toggle("is-done", s < +key);
    });

    /* On a narrow screen the figure scrolls sideways: keep the active stage
       in view, unless the reader has just scrolled it themselves */
    var over = scroller.scrollWidth - scroller.clientWidth;
    if (!fast && over > 4 && performance.now() - userPanned > 2500) {
      var k = svg.clientWidth / VW;
      panUntil = performance.now() + 900;
      scroller.scrollTo({ left: ((r[0] + r[1]) / 2) * k - scroller.clientWidth / 2, behavior: "smooth" });
    }
  }

  function say(k) { caption.innerHTML = CAPTION[k]; }

  function setCase(c) {
    Object.keys(reg).forEach(function (k) {
      reg[k].classList.toggle("is-hidden", reg[k].getAttribute("data-case").indexOf(c) < 0);
    });
    for (var j = 0; j < caseBtns.length; j++) {
      caseBtns[j].setAttribute("aria-pressed", caseBtns[j].getAttribute("data-case") === c ? "true" : "false");
    }
    reg.H6.__title.textContent = (c === "a" ? "4" : "5") + " accepted";
  }

  /* Put everything from stage `from` onward back to its unplayed state */
  function reset(from) {
    Object.keys(reg).forEach(function (k) {
      var e = reg[k];
      if (+e.getAttribute("data-stage") < from) { return; }
      e.classList.add("is-off");
      e.classList.remove("is-dim", "is-bad", "is-win", "is-hot", "is-active", "is-done");
    });
    if (from <= 1) { band.classList.add("is-off"); band.style.transform = ""; }
  }

  async function stages1to3(ok) {
    focusStage(1); say(1);
    await all([0, 1, 2, 3].map(function (r) { return pop("1h" + r, r * 70); })); ok();
    await all([0, 1, 2, 3].map(function (r) { return fly("1x" + (r + 1), "1h" + r, r * 70, 380); })); ok();
    await wait(450); ok();

    await draw("F1"); ok();
    focusStage(2); say(2);
    await all([0, 1, 2, 3].map(function (r) { return pop("2s" + r, r * 60); })); ok();
    await all([0, 1, 2, 3].map(function (r) {
      return all([fly("2v" + (r + 1), "2s" + r, r * 60, 380), fly("2x" + (r + 1), "1x" + (r + 1), r * 90)]);
    })); ok();
    /* rows are judged one after another, overlapping so the eye can follow */
    await all([0, 1, 2, 3].map(function (r) { return verdict("2c" + r, r * 300); })); ok();
    await wait(500); ok();

    await draw("F2"); ok();
    focusStage(3); say(3);
    await all([fly("3k0", "2x4", 0), fly("3k1", "2v2", 90), fly("3k2", "2v3", 180), fly("3k3", "2v4", 270)]); ok();
    await all([0, 1, 2, 3].map(function (r) { return pop("3h" + r, r * 60); })); ok();
    await all([0, 1, 2, 3].map(function (r) { return pop("3s" + r, r * 60); })); ok();
    await wait(500); ok();
  }

  async function stage4(c, ok) {
    await draw("F3"); ok();
    focusStage(4); say("4" + c);
    await all([0, 1, 2, 3].map(function (r) { return pop("4t" + r, r * 60); })); ok();
    await all([0, 1, 2, 3].map(function (r) {
      return all([fly("4n" + (r + 1), "4t" + r, r * 60, 380), fly("4x" + (r + 1), "2x" + (r + 1), r * 90, 760)]);
    })); ok();
    var rows = c === "a" ? [0, 1, 2] : [0, 1, 2, 3];
    await all(rows.map(function (r) {
      return verdict("4c" + c + r, r * 320).then(function () {
        ok();
        if (c === "a" && r === 2) { set("4x3", "is-bad"); set("4x4", "is-dim"); }
      });
    })); ok();
    await wait(550); ok();
  }

  async function stage5a(ok) {
    await draw("F4"); ok();
    focusStage("5a"); say("5a");
    set("5x3", "is-bad"); set("5x4", "is-dim");
    await all([1, 2, 3, 4].map(function (n, r) { return fly("5x" + n, "4x" + n, r * 70, 520); })); ok();
    await all([fly("5v2", "3k1", 0), fly("5v3", "3k2", 90), fly("5v4", "3k3", 180)]); ok();
    await all([0, 1, 2, 3].map(function (r) {
      return all([pop("5t" + r, r * 60), pop("5n" + r, 120 + r * 60)]);
    })); ok();
    ["5t0", "5n0", "5t3", "5n3", "5v2", "5v4"].forEach(function (k) { set(k, "is-dim"); });
    await verdict("5c"); ok();
    set("5v3", "is-hot");
    await wait(160); ok();
    await verdict("5d"); ok();
    set("5n2", "is-hot");
    await wait(600); ok();
  }

  async function stage5b(ok) {
    focusStage("5b"); say("5b");
    await verdict("5bc"); ok();
    await all([pop("5bt"), pop("5bn", 140)]); ok();
    set("5bn", "is-hot");
    await wait(600); ok();
  }

  async function stage6(c, ok) {
    await draw("F5" + c); ok();
    focusStage(6); say("6" + c);
    reg.H6.__title.textContent = (c === "a" ? "4" : "5") + " accepted";
    var from = c === "a" ? ["5x1", "5x2", "5v3", "5n2"] : ["4x1", "4x2", "4x3", "4x4", "5bn"];
    await all(from.map(function (src, r) {
      set("6" + c + r, "is-win");
      return fly("6" + c + r, src, r * 170, 700);
    })); ok();
  }

  async function playCase(c, keepFirstStages) {
    var id = ++run;
    cancelAll();
    var ok = function () { if (id !== run) { throw CANCEL; } };
    setCase(c);
    reset(keepFirstStages ? 4 : 1);
    try {
      if (!keepFirstStages) { await stages1to3(ok); }
      await stage4(c, ok);
      if (c === "a") { await stage5a(ok); } else { await stage5b(ok); }
      await stage6(c, ok);
      return true;
    } catch (e) {
      if (e !== CANCEL) { throw e; }
      return false;
    }
  }

  /* Reduced motion / instant: the finished frame of a case */
  function finish(c) {
    fast = true;
    return playCase(c).then(function () { fast = !!reduce; });
  }

  var autoChain = true;

  function start() {
    playCase("a").then(function (done) {
      if (!done || !autoChain) { return; }
      return wait(1800).then(function () {
        if (!autoChain) { return; }
        return playCase("b", true);
      });
    });
  }

  for (var j = 0; j < caseBtns.length; j++) {
    caseBtns[j].addEventListener("click", function (e) {
      autoChain = false;
      var c = e.currentTarget.getAttribute("data-case");
      if (reduce) { finish(c); } else { playCase(c); }
    });
  }
  replayBtn.addEventListener("click", function () {
    autoChain = false;
    var pressed = bar.querySelector('[aria-pressed="true"]');
    playCase(pressed ? pressed.getAttribute("data-case") : "a");
  });

  window.__verifyLoop = {
    state: function () {
      return {
        run: run,
        caption: caption.textContent,
        visible: Object.keys(reg).filter(function (k) {
          return !reg[k].classList.contains("is-off") && !reg[k].classList.contains("is-hidden");
        }).length
      };
    },
    finish: finish
  };

  /* Show the finished Case 1 until the figure is actually seen. The instant
     run still awaits between steps, so animation is only switched back on
     once it has really finished. */
  finish("a").then(function () {
    if (reduce) { return; }
    var started = false;
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (started || !entries[0].isIntersecting) { return; }
        started = true;
        io.disconnect();
        start();
      }, { threshold: 0.45 });
      io.observe(scroller);
    }
  });
})();
