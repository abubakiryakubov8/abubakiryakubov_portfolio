/* Matrix rain — canvas, no dependencies.
   Abubakir Yakubov · abubakiryakubov8.github.io */

(function () {
  "use strict";

  var canvas = document.getElementById("rain");
  if (!canvas) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ctx = canvas.getContext("2d", { alpha: true });
  var glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789ABCDEF<>{}[]/\\|=+*";
  var columns = 0;
  var drops = [];
  var fontSize = 16;
  var dpr = 1;
  var running = false;
  var frame = 0;
  var speed = 3;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = fontSize + "px 'Share Tech Mono', ui-monospace, monospace";

    columns = Math.ceil(w / fontSize);
    drops = new Array(columns);
    for (var i = 0; i < columns; i += 1) {
      drops[i] = Math.random() * -60;
    }
  }

  function draw() {
    if (!running) return;

    /* fade the previous frame instead of clearing it */
    ctx.fillStyle = "rgba(3, 7, 10, 0.09)";
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    for (var i = 0; i < columns; i += 1) {
      var char = glyphs.charAt(Math.floor(Math.random() * glyphs.length));
      var x = i * fontSize;
      var y = drops[i] * fontSize;

      /* head of each column is bright, body dim */
      ctx.fillStyle = "rgba(180, 255, 240, 0.85)";
      ctx.fillText(char, x, y);

      ctx.fillStyle = "rgba(0, 255, 156, 0.35)";
      ctx.fillText(char, x, y - fontSize * 1.6);

      drops[i] += 1;

      if (y > canvas.height / dpr && Math.random() > 0.975) {
        drops[i] = Math.random() * -20;
      }
    }

    frame += 1;
    if (frame % speed === 0) {
      /* slow the rain to a readable pace without a timer per column */
      window.requestAnimationFrame(draw);
    } else {
      window.requestAnimationFrame(draw);
    }
  }

  function start() {
    if (running || reduce.matches) return;
    running = true;
    draw();
  }

  function stop() {
    running = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /* --- toggle button ------------------------------------------------- */

  var toggle = document.getElementById("rain-toggle");
  var stored = null;
  try {
    stored = localStorage.getItem("rain");
  } catch (e) {
    stored = null;
  }

  function paintToggle() {
    if (!toggle) return;
    toggle.setAttribute("aria-pressed", running ? "true" : "false");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      if (running) {
        stop();
        try { localStorage.setItem("rain", "off"); } catch (e) {}
      } else {
        size();
        start();
        try { localStorage.setItem("rain", "on"); } catch (e) {}
      }
      paintToggle();
    });
  }

  /* --- lifecycle ------------------------------------------------------ */

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      size();
      if (!running) stop();
    }, 180);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      running = false;
    } else if (toggle && toggle.getAttribute("aria-pressed") === "true") {
      start();
    }
  });

  size();

  if (reduce.matches || stored === "off") {
    stop();
  } else {
    start();
  }

  paintToggle();
})();
