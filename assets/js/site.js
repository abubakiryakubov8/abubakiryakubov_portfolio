/* Site behaviour — boot sequence, typing, reveal, counters, nav.
   Abubakir Yakubov · abubakiryakubov8.github.io */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var boot = document.getElementById("boot");

  /* ================= opening sequence ================= */

  var LINES = [
    "> handshake with node ........... <span class='ok'>ok</span>",
    "> node: seongnam-kr · gachon ........ <span class='ok'>ok</span>",
    "> reading identity ............ <span class='ok'>ok</span>",
    "> decrypting profile ..... <span class='dim'>abubakir yakubov</span>",
    "> stack: <span class='hl'>python / c++ / javascript</span>",
    "> mounting project archive .... <span class='ok'>ok</span>",
    "> integrity check ......... <span class='ok'>100%</span>"
  ];
  var TOTAL = LINES.join("").length;

  function bootDone() {
    if (!boot) return;
    boot.classList.add("boot--out");
    document.body.classList.remove("is-booting");
    try { sessionStorage.setItem("booted", "1"); } catch (e) {}
    window.setTimeout(function () {
      if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
    }, 1000);
    document.dispatchEvent(new CustomEvent("boot:done"));
  }

  function runBoot() {
    var log = document.getElementById("boot-log");
    var fill = document.getElementById("boot-fill");
    var pct = document.getElementById("boot-pct");
    var step = document.getElementById("boot-step");
    if (!log || !fill || !pct) return bootDone();

    var typed = 0;
    var index = 0;
    var timer = null;
    var finished = false;

    function finish(skip) {
      if (finished) return;
      finished = true;
      if (timer) window.clearTimeout(timer);
      if (skip) {
        log.innerHTML = LINES.join("\n");
        fill.style.width = "100%";
        pct.textContent = "100";
        if (step) step.textContent = "access granted";
      }
      window.setTimeout(bootDone, skip ? 220 : 620);
    }

    if (step) step.textContent = "initialising uplink";

    function typeNext() {
      if (finished) return;

      if (index >= LINES.length) {
        finished = true;
        log.innerHTML = LINES.join("\n") + "\n<span class='hl'>&gt; ACCESS GRANTED</span>";
        fill.style.width = "100%";
        pct.textContent = "100";
        if (step) step.textContent = "access granted";
        window.setTimeout(bootDone, 700);
        return;
      }

      var line = LINES[index];
      var plain = line.replace(/<[^>]+>/g, "");
      var chars = 0;

      log.innerHTML = LINES.slice(0, index).join("\n") + "\n";

      (function tick() {
        if (finished) return;
        chars += 1;
        var partial = plain.slice(0, chars);
        log.innerHTML = LINES.slice(0, index).join("\n") + "\n" + partial;
        typed = LINES.slice(0, index).join("").length + chars;
        var percent = Math.min(100, Math.round((typed / TOTAL) * 100));
        fill.style.width = percent + "%";
        pct.textContent = String(percent);

        if (chars < plain.length) {
          timer = window.setTimeout(tick, 9);
        } else {
          log.innerHTML = LINES.slice(0, index).join("\n") + "\n" + line;
          index += 1;
          timer = window.setTimeout(typeNext, 130);
        }
      })();
    }

    var skip = document.getElementById("boot-skip");
    if (skip) skip.addEventListener("click", function () { finish(true); });

    document.addEventListener("keydown", function onKey(event) {
      if (!finished && (event.key === "Escape" || event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        finish(true);
        document.removeEventListener("keydown", onKey);
      }
    });

    window.setTimeout(typeNext, 220);

    /* hard stop so the overlay can never trap the page */
    window.setTimeout(function () { finish(true); }, 9000);
  }

  var seen = false;
  try { seen = sessionStorage.getItem("booted") === "1"; } catch (e) { seen = false; }

  if (!boot) {
    /* nothing to do */
  } else if (reduce.matches || seen) {
    boot.parentNode.removeChild(boot);
    boot = null;
  } else {
    document.body.classList.add("is-booting");
    runBoot();
  }

  /* ================= hero typing ================= */

  var typedEl = document.getElementById("typed");
  var PHRASES = [
    "Computer Engineering student",
    "Machine learning · Python",
    "Data structures & algorithms",
    "Edge AI · embedded systems"
  ];

  if (typedEl) {
    if (reduce.matches) {
      typedEl.textContent = PHRASES[0];
    } else {
      var phrase = 0;
      var pos = 0;
      var deleting = false;

      var loop = function () {
        var text = PHRASES[phrase];
        pos += deleting ? -1 : 1;
        typedEl.textContent = text.slice(0, pos);

        var delay = deleting ? 28 : 55;
        if (!deleting && pos === text.length) {
          deleting = true;
          delay = 1900;
        } else if (deleting && pos === 0) {
          deleting = false;
          phrase = (phrase + 1) % PHRASES.length;
          delay = 260;
        }
        window.setTimeout(loop, delay);
      };
      loop();
    }
  }

  /* ================= reveal on scroll ================= */

  var revealables = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || reduce.matches) {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ================= counters ================= */

  var counters = document.querySelectorAll("[data-count]");

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var pad = target < 10 && decimals === 0 ? 2 : 0;
    var start = null;
    var dur = 1300;

    if (reduce.matches) {
      el.textContent = target.toFixed(decimals).padStart(pad + (decimals ? 0 : 0), "0");
      return;
    }

    function frame(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var value = (target * eased).toFixed(decimals);
      el.textContent = pad ? String(value).padStart(2, "0") : value;
      if (t < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            co.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* ================= nav: progress + active link ================= */

  var progress = document.getElementById("progress");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var watched = ["about", "skills", "work", "contact"];

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? doc.scrollTop / max : 0;
    if (progress) progress.style.width = (ratio * 100).toFixed(2) + "%";

    var current = "";
    watched.forEach(function (id) {
      var section = document.getElementById(id);
      if (!section) return;
      var rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.4) current = id;
    });

    navLinks.forEach(function (link) {
      var match = link.getAttribute("href") === "#" + current;
      link.classList.toggle("is-active", match);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ================= clock (KST) ================= */

  var clock = document.getElementById("clock");
  if (clock) {
    var time = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    var tick = function () { clock.textContent = time.format(new Date()) + " KST"; };
    tick();
    window.setInterval(tick, 1000);
  }

  /* ================= portrait (optional) ================= */

  var img = document.getElementById("idcard-img");
  var mono = document.getElementById("idcard-mono");
  if (img) {
    var probe = new Image();
    probe.onload = function () {
      img.hidden = false;
      if (mono) mono.style.display = "none";
    };
    probe.onerror = function () {
      img.hidden = true;
      if (mono) mono.style.display = "";
    };
    probe.src = img.getAttribute("src");
  }

  /* ================= identity card tilt ================= */

  var card = document.querySelector(".idcard__frame");
  if (card && window.matchMedia("(hover: hover)").matches && !reduce.matches) {
    var raf = null;
    var target = { x: 0, y: 0 };

    card.addEventListener("mousemove", function (event) {
      var rect = card.getBoundingClientRect();
      var px = (event.clientX - rect.left) / rect.width - 0.5;
      var py = (event.clientY - rect.top) / rect.height - 0.5;
      target.x = (-py * 8).toFixed(2);
      target.y = (px * 10).toFixed(2);
      if (!raf) {
        raf = window.requestAnimationFrame(function () {
          card.style.transform = "rotateX(" + target.x + "deg) rotateY(" + target.y + "deg)";
          raf = null;
        });
      }
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });
  }

  /* ================= footer year ================= */

  var year = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(year);
  });
})();
