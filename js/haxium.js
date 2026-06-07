/* Haxium AI — interactions. All progressive enhancement; content works without JS. */
(function () {
  "use strict";

  /* mark page as JS-enabled so reveal animations engage (content stays visible without JS) */
  document.documentElement.classList.add("js");

  /* ---------- waveform bar generators ---------- */
  function buildWave(el, count, base) {
    if (!el) return;
    var html = "";
    for (var i = 0; i < count; i++) {
      var h = 0.28 + 0.72 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.31));
      var dur = (base + (i % 5) * 0.12).toFixed(2);
      var delay = ((i % 12) * 0.09).toFixed(2);
      html += '<i style="--h:' + h.toFixed(2) + ';animation-duration:' + dur + 's;animation-delay:' + delay + 's"></i>';
    }
    el.innerHTML = html;
  }
  document.querySelectorAll(".wave").forEach(function (w) { buildWave(w, 32, 1.0); });
  document.querySelectorAll(".player-wave").forEach(function (w) { buildWave(w, 56, 0.9); });

  /* ---------- nav scroll state ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 24); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector(".nav-burger");
  var menu = document.querySelector(".m-menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("show"); });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { menu.classList.remove("show"); });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (o) {
        o.classList.remove("open");
        var oa = o.querySelector(".faq-a"); if (oa) oa.style.maxHeight = null;
      });
      if (!open) { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---------- scroll reveal (IO + robust fallback so content always shows) ---------- */
  var reveals = [].slice.call(document.querySelectorAll(".reveal"));
  function revealInView() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = reveals.length - 1; i >= 0; i--) {
      var r = reveals[i];
      var rect = r.getBoundingClientRect();
      if (rect.top < vh * 0.92 && rect.bottom > 0) {
        r.classList.add("in");
        reveals.splice(i, 1);
      }
    }
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
          var idx = reveals.indexOf(e.target);
          if (idx > -1) reveals.splice(idx, 1);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  }
  /* fallback: reveal anything already in view on load + on scroll, regardless of IO */
  revealInView();
  window.addEventListener("scroll", revealInView, { passive: true });
  window.addEventListener("resize", revealInView);
  window.addEventListener("load", revealInView);
  /* safety net: if anything is still hidden a moment after load, show it */
  setTimeout(function () { reveals.slice().forEach(function (r) { r.classList.add("in"); }); }, 2500);

  /* ---------- missed-revenue calculator ---------- */
  var calc = document.getElementById("calc");
  if (calc) {
    var els = {
      calls: document.getElementById("c-calls"),
      value: document.getElementById("c-value"),
      missed: document.getElementById("c-missed"),
      close: document.getElementById("c-close")
    };
    var out = {
      callsV: document.getElementById("v-calls"),
      valueV: document.getElementById("v-value"),
      missedV: document.getElementById("v-missed"),
      closeV: document.getElementById("v-close"),
      big: document.getElementById("r-big"),
      mCalls: document.getElementById("r-mcalls"),
      mLost: document.getElementById("r-lost"),
      mRecover: document.getElementById("r-recover"),
      mYear: document.getElementById("r-year")
    };
    var money = function (n) {
      n = Math.round(n);
      if (n >= 1000000) return "$" + (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
      return "$" + n.toLocaleString("en-US");
    };
    function recompute() {
      var callsDay = +els.calls.value;
      var avgVal = +els.value.value;
      var missRate = +els.missed.value / 100;
      var closeRate = +els.close.value / 100;

      var callsMonth = callsDay * 26;                 // ~26 working days
      var missedMonth = callsMonth * missRate;
      // of the calls you miss, closeRate = share that would have become paying customers
      var lostCustomers = missedMonth * closeRate;
      var lostRevMonth = lostCustomers * avgVal;
      var recovered = lostRevMonth * 0.9;             // Haxium answers ~all of them

      out.callsV.textContent = callsDay + "/day";
      out.valueV.textContent = money(avgVal);
      out.missedV.textContent = els.missed.value + "%";
      out.closeV.textContent = els.close.value + "%";

      out.big.textContent = money(lostRevMonth);
      out.mCalls.textContent = Math.round(missedMonth).toLocaleString("en-US");
      out.mLost.textContent = Math.round(lostCustomers).toLocaleString("en-US");
      out.mRecover.textContent = money(recovered) + "/mo";
      out.mYear.textContent = money(lostRevMonth * 12);
    }
    Object.keys(els).forEach(function (k) {
      els[k].addEventListener("input", recompute);
    });
    recompute();
  }

  /* ---------- demo audio player ---------- */
  var player = document.querySelector(".player");
  if (player) {
    var audio = document.getElementById("demoAudio");
    var playBtn = player.querySelector(".play-btn");
    var fill = player.querySelector(".player-fill");
    var timeEl = player.querySelector(".player-time");
    var iconPlay = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    var iconPause = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
    function fmt(t) {
      if (isNaN(t)) t = 0;
      var m = Math.floor(t / 60), s = Math.floor(t % 60);
      return m + ":" + (s < 10 ? "0" : "") + s;
    }
    if (audio && playBtn) {
      playBtn.innerHTML = iconPlay;
      playBtn.addEventListener("click", function () {
        if (audio.paused) { audio.play(); } else { audio.pause(); }
      });
      audio.addEventListener("play", function () { player.classList.add("playing"); playBtn.innerHTML = iconPause; });
      audio.addEventListener("pause", function () { player.classList.remove("playing"); playBtn.innerHTML = iconPlay; });
      audio.addEventListener("ended", function () { player.classList.remove("playing"); playBtn.innerHTML = iconPlay; if (fill) fill.style.width = "0%"; });
      audio.addEventListener("timeupdate", function () {
        if (fill && audio.duration) fill.style.width = (audio.currentTime / audio.duration * 100) + "%";
        if (timeEl) timeEl.textContent = fmt(audio.currentTime) + " / " + fmt(audio.duration);
      });
      audio.addEventListener("loadedmetadata", function () {
        if (timeEl) timeEl.textContent = "0:00 / " + fmt(audio.duration);
      });
    }
  }
})();
