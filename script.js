/* 神驰布艺 SHENCHI · script.js */
(function () {
  "use strict";

  /* ---------- 头部滚动阴影 / Hero 上方透明白字 ---------- */
  var header = document.querySelector(".header");
  var hero = document.querySelector(".hero");
  function onScrollHeader() {
    if (!header) return;
    var y = window.scrollY;
    var heroH = hero ? hero.offsetHeight - 80 : 0;
    header.classList.toggle("scrolled", y > 40);
    header.classList.toggle("hero-mode", y < heroH);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 图片容器：KINTO 遮罩揭示（clip + scale） ---------- */
  [
    ".scene-img",
    ".product-img",
    ".journal-img",
    ".craft-video-frame",
    ".custom-poster img"
  ].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.classList.add("kinto");
      el.setAttribute("data-d", String(i % 4));
    });
  });

  /* ---------- 文字 / 面板：轻淡入上移 ---------- */
  [
    ".featured-title",
    ".scene-text",
    ".product-info",
    ".journal-info",
    ".series-item",
    ".series-text",
    ".craft-text",
    ".custom-text",
    ".custom-poster",
    ".sub-brand-text",
    ".quote blockquote"
  ].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.classList.add("reveal");
      el.setAttribute("data-d", String(i % 4));
    });
  });

  /* ---------- 滚动揭示（KINTO inview 复刻 · 双向触发） ----------
     进入视口 → 加 .in 播放揭示；离开视口 → 移除 .in 复位，
     这样每次向下滑动都会重新播放揭示效果 */
  var revealEls = document.querySelectorAll(".reveal, .kinto");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          e.target.classList.toggle("in", e.isIntersecting);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 导航当前区块高亮 ---------- */
  var navLinks = document.querySelectorAll(".nav a[href^='#']");
  var sections = [];
  navLinks.forEach(function (a) {
    var sec = document.querySelector(a.getAttribute("href"));
    if (sec) sections.push({ link: a, sec: sec });
  });
  if ("IntersectionObserver" in window && sections.length) {
    var ioNav = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            navLinks.forEach(function (a) { a.style.color = ""; });
            sections.forEach(function (s) {
              if (s.sec === e.target) s.link.style.color = "var(--red)";
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { ioNav.observe(s.sec); });
  }

  /* ---------- Hero 进度点切换 + 自动轮播 ---------- */
  var dots    = document.querySelectorAll(".hero-progress .dot");
  var barI    = document.querySelector(".hero-progress .bar i");
  var count   = document.querySelector(".hero-progress .count");
  var slides  = document.querySelectorAll(".hero-pic");
  var metas   = document.querySelectorAll(".hero-meta-stack .hero-meta");
  var heroEl  = document.querySelector(".hero");
  var total   = slides.length || 1;
  var idx     = 0;          // 当前 0-based
  var timer   = null;       // 自动轮播
  var WAIT_MS = 5200;       // 每张停留
  var PAUSE   = false;      // 鼠标悬浮时暂停

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function go(i) {
    i = ((i % total) + total) % total;
    if (i === idx) return;
    idx = i;

    // 图层
    slides.forEach(function (s, k) { s.classList.toggle("active", k === idx); });
    // 文案
    metas.forEach(function (m, k) { m.classList.toggle("active", k === idx); });
    // 进度点
    dots.forEach(function (d, k) { d.classList.toggle("active", k === idx); });
    // 数字
    if (count) count.textContent = pad(idx + 1) + " / " + pad(total);
    // 进度条
    if (barI) barI.style.width = ((idx + 1) / total * 100) + "%";
  }

  function tick() { go(idx + 1); }

  function startAuto() {
    stopAuto();
    if (PAUSE || total < 2) return;
    timer = setInterval(tick, WAIT_MS);
  }
  function stopAuto() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  // 点小点切换
  dots.forEach(function (b, i) {
    b.addEventListener("click", function () {
      go(i);
      startAuto();  // 重新计时
    });
  });

  // 鼠标悬浮 Hero：暂停自动轮播
  if (heroEl) {
    heroEl.addEventListener("mouseenter", function () { PAUSE = true; stopAuto(); });
    heroEl.addEventListener("mouseleave", function () { PAUSE = false; startAuto(); });
  }

  // 启动
  startAuto();

  /* ---------- 订阅表单 ---------- */
  var form = document.querySelector(".footer-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var input = form.querySelector("input");
      var btn = form.querySelector("button");
      if (input && input.value.indexOf("@") > 0) {
        btn.textContent = "✓ 已订阅";
        input.value = "";
        setTimeout(function () { btn.textContent = "订阅"; }, 2600);
      } else if (input) {
        input.placeholder = "请输入有效邮箱";
        input.focus();
      }
    });
  }
})();
