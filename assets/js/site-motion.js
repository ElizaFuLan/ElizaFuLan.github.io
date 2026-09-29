/* Site motion. Loaded with `defer`; everything here is additive: the page is
   complete without it, and any failure leaves the finished content in place.

   1. Masthead hairline once the page has scrolled
   2. Hero statement written by speculative decoding (the research, acted out)
   3. The speedup figure counts up once when it arrives */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- 1 --- */

  var ticking = false;
  function syncScrolled() {
    ticking = false;
    root.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(syncScrolled);
    }
  }, { passive: true });
  syncScrolled();

  if (reduceMotion) { return; }

  /* ---------------------------------------------------------------- 2 --- */

  function wait(ms) {
    return new Promise(function (resolve) { window.setTimeout(resolve, ms); });
  }

  /* "a b +c | d ~e +f" -> [[{text,kind}], ...]; kind: accept | reject | target */
  function parseSpec(src) {
    return src.split("|").map(function (step) {
      return step.trim().split(/\s+/).filter(Boolean).map(function (raw) {
        if (raw.charAt(0) === "~") { return { kind: "reject", text: raw.slice(1) }; }
        if (raw.charAt(0) === "+") { return { kind: "target", text: raw.slice(1) }; }
        return { kind: "accept", text: raw };
      });
    }).filter(function (step) { return step.length; });
  }

  function SpecLine(el) {
    this.el = el;
    this.text = el.textContent.replace(/\s+/g, " ").trim();
    this.steps = parseSpec(el.getAttribute("data-spec") || "");
    this.readout = el.parentNode.querySelector(".hero__readout-text");
    this.replay = el.parentNode.querySelector(".hero__replay");
    this.run = 0;
  }

  /* Only animate a schedule that really spells the sentence */
  SpecLine.prototype.valid = function () {
    var out = [];
    this.steps.forEach(function (step) {
      step.forEach(function (t) { if (t.kind !== "reject") { out.push(t.text); } });
    });
    return this.steps.length > 0 && out.join(" ") === this.text;
  };

  SpecLine.prototype.say = function (msg) {
    if (this.readout) { this.readout.textContent = msg; }
  };

  SpecLine.prototype.token = function (line, text, cls) {
    var span = document.createElement("span");
    span.className = "tok " + cls;
    span.textContent = text;
    var gap = document.createTextNode(" ");
    line.appendChild(span);
    line.appendChild(gap);
    return { el: span, gap: gap };
  };

  SpecLine.prototype.start = function () {
    var self = this;
    var id = ++self.run;
    var el = self.el;
    var alive = function () { return id === self.run; };

    /* Reserve the finished height so nothing below moves while it writes */
    el.style.minHeight = "";
    el.style.minHeight = el.offsetHeight + "px";

    var sr = document.createElement("span");
    sr.className = "visually-hidden";
    sr.textContent = self.text;
    var line = document.createElement("span");
    line.setAttribute("aria-hidden", "true");
    el.textContent = "";
    el.appendChild(sr);
    el.appendChild(line);
    el.classList.remove("is-done");
    el.classList.add("is-running");
    if (self.replay) { self.replay.disabled = true; }

    var total = self.steps.length;
    var emitted = 0;
    var rejected = 0;

    var chain = Promise.resolve();
    self.steps.forEach(function (step, s) {
      chain = chain.then(function () {
        if (!alive()) { return; }
        var drafts = step.filter(function (t) { return t.kind !== "target"; });
        var targets = step.filter(function (t) { return t.kind === "target"; });
        var nodes = [];
        self.say("step " + (s + 1) + "/" + total + " · draft proposes " + drafts.length);

        var p = Promise.resolve();
        drafts.forEach(function (t) {
          p = p.then(function () {
            if (!alive()) { return; }
            var n = self.token(line, t.text, "is-draft");
            n.kind = t.kind;
            nodes.push(n);
            return wait(75);
          });
        });

        return p.then(function () { return wait(240); })
          .then(function () {
            if (!alive()) { return; }
            self.say("step " + (s + 1) + "/" + total + " · target verifies in one pass");
            return wait(360);
          })
          .then(function () {
            if (!alive()) { return; }
            var acc = 0;
            var rej = 0;
            nodes.forEach(function (n) {
              n.el.classList.remove("is-draft");
              if (n.kind === "accept") {
                n.el.classList.add("is-accepted");
                acc++;
              } else {
                n.el.classList.add("is-rejected");
                rej++;
              }
            });
            emitted += acc;
            rejected += rej;
            self.say("step " + (s + 1) + "/" + total + " · accepted " + acc + "/" + drafts.length +
              (rej ? " · rejected " + rej : ""));
            if (!rej) { return wait(220); }

            /* Rejected drafts leave in two beats: fade out where they stand,
               then the line closes over the empty space. Doing both at once
               slides the next word across a word that is still visible. */
            var rejects = nodes.filter(function (n) { return n.kind === "reject"; });
            return wait(480).then(function () {
              if (!alive()) { return; }
              rejects.forEach(function (n) { n.el.classList.add("is-gone"); });
              return wait(240);
            }).then(function () {
              if (!alive()) { return; }
              rejects.forEach(function (n) {
                /* swallow the word and the space after it, so removing both
                   afterwards moves nothing */
                var range = document.createRange();
                range.selectNodeContents(n.gap);
                var w = n.el.getBoundingClientRect().width + range.getBoundingClientRect().width;
                n.el.style.marginRight = -w + "px";
              });
              return wait(300);
            }).then(function () {
              nodes.forEach(function (n) {
                if (n.kind !== "reject") { return; }
                if (n.el.parentNode) { n.el.parentNode.removeChild(n.el); }
                if (n.gap.parentNode) { n.gap.parentNode.removeChild(n.gap); }
              });
            });
          })
          .then(function () {
            if (!alive()) { return; }
            var q = Promise.resolve();
            targets.forEach(function (t) {
              q = q.then(function () {
                if (!alive()) { return; }
                var n = self.token(line, t.text, "is-target");
                emitted++;
                window.setTimeout(function () { n.el.classList.add("is-settled"); }, 900);
                return wait(200);
              });
            });
            return q;
          });
      });
    });

    return chain.then(function () {
      if (!alive()) { return; }
      el.classList.remove("is-running");
      el.classList.add("is-done");
      el.style.minHeight = "";
      self.say("↳ speculatively decoded · " + emitted + " tokens · " + total +
        " target passes · " + rejected + " rejected");
      if (self.replay) { self.replay.hidden = false; self.replay.disabled = false; }
    });
  };

  function initSpec() {
    var el = document.querySelector(".hero__statement[data-spec]");
    if (!el) { return; }
    var spec = new SpecLine(el);
    if (!spec.valid()) {
      el.classList.add("is-done");
      return;
    }
    if (spec.replay) {
      spec.replay.addEventListener("click", function () { spec.start(); });
    }
    var go = function () { window.setTimeout(function () { spec.start(); }, 650); };
    if (document.visibilityState === "hidden") {
      var onVisible = function () {
        if (document.visibilityState !== "hidden") {
          document.removeEventListener("visibilitychange", onVisible);
          go();
        }
      };
      document.addEventListener("visibilitychange", onVisible);
    } else {
      go();
    }
  }

  /* ---------------------------------------------------------------- 3 --- */

  function initCounters() {
    var items = document.querySelectorAll("[data-count]");
    if (!items.length || !("IntersectionObserver" in window)) { return; }

    var FROM = 1;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        io.unobserve(entry.target);
        var el = entry.target;
        var finalText = el.getAttribute("data-final");
        var to = parseFloat(el.getAttribute("data-count"));
        var from = FROM;
        var dur = 1300;
        var t0 = null;
        var frame = function (now) {
          if (t0 === null) { t0 = now; }
          var k = Math.min(1, (now - t0) / dur);
          var eased = 1 - Math.pow(1 - k, 4);
          el.textContent = (from + (to - from) * eased).toFixed(2) + "×";
          if (k < 1) { window.requestAnimationFrame(frame); } else { el.textContent = finalText; }
        };
        window.requestAnimationFrame(frame);
      });
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0.6 });

    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      var to = parseFloat(el.getAttribute("data-count"));
      /* Only rewind a figure nobody can see yet; one already on screen stays */
      if (!(to > FROM) || el.getBoundingClientRect().top < window.innerHeight) { continue; }
      /* Screen readers keep the real value while the visible one counts */
      var real = document.createElement("span");
      real.className = "visually-hidden";
      real.textContent = el.textContent;
      el.parentNode.insertBefore(real, el);
      el.setAttribute("aria-hidden", "true");
      el.setAttribute("data-final", el.textContent);
      el.textContent = FROM.toFixed(2) + "×";
      io.observe(el);
    }
  }

  try { initSpec(); } catch (e) { /* the plain sentence stays */ }
  try { initCounters(); } catch (e) { /* the final figure stays */ }
})();
