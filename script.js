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

  /* ---------- 图片容器：KINTO 遮罩揭示（clip + scale） ----------
     注：fc-img 不在此列。fc-img 在 overflow-x:auto 水平 carousel 里
     IntersectionObserver 会漏触发，导致图片永远不可见（clip-path 默认
     裁掉）。fc-img 默认可见，hover scale + fc-info 淡入已足够。 */
  [
    ".scene-img",
    ".journal-img",
    ".craft-video-frame",
    ".custom-poster img"
  ].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add("kinto");
      el.setAttribute("data-d", "0");
    });
  });

  /* ---------- 文字 / 面板：轻淡入上移 ---------- */
  [
    ".featured-title",
    ".scene-text",
    ".fc-info",
    ".journal-info",
    ".series-item",
    ".series-text",
    ".craft-text",
    ".custom-text",
    ".custom-poster",
    ".sub-brand-text",
    ".quote blockquote"
  ].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add("reveal");
      el.setAttribute("data-d", "0");
    });
  });

  /* ---------- 滚动揭示（KINTO inview 复刻 · 可重复播放） ----------
     进入视口 → 加 .in 播放缓慢揭示；
     完全离开视口 → 加 .instant 瞬时复位到隐藏态（不播反向动画），
     这样每次滚入都会从头播放完整的揭示效果 */
  var revealEls = document.querySelectorAll(".reveal, .kinto");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          var el = e.target;
          if (e.isIntersecting && e.intersectionRatio >= 0.15) {
            el.classList.remove("instant");
            el.classList.add("in");
          } else if (!e.isIntersecting && e.intersectionRatio === 0) {
            // 已完全滚出视口：瞬时复位
            el.classList.add("instant");
            el.classList.remove("in");
            void el.offsetWidth; /* 强制 reflow，让复位立即生效 */
            el.classList.remove("instant");
          }
        });
      },
      { threshold: [0, 0.15], rootMargin: "0px 0px -6% 0px" }
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

  /* ---------- 商品横列 carousel（KINTO product 左右切换 + 自动滚动） ---------- */
  var rail  = document.querySelector(".featured-rail");
  var track = document.querySelector(".featured-track");
  var btnPrev = document.querySelector(".fn-prev");
  var btnNext = document.querySelector(".fn-next");

  function stepWidth() {
    var first = track && track.querySelector(".fc-card");
    if (!first) return 360;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 32;
    return first.getBoundingClientRect().width + gap;
  }

  function maxScroll() {
    if (!rail) return 0;
    return rail.scrollWidth - rail.clientWidth - 2;
  }

  function updateNavState() {
    if (!rail || !btnPrev || !btnNext) return;
    var max = maxScroll();
    btnPrev.disabled = rail.scrollLeft <= 2;
    btnNext.disabled = rail.scrollLeft >= max;
  }

  /* --- 自动滚动 --- */
  var fcTimer = null;
  var fcPause = false;          // hover 时置 true
  var FC_INTERVAL = 3000;       // 每 3 秒滚两张

  function fcAutoNext() {
    if (!rail) return;
    var step  = stepWidth();          // 单张卡宽度（含 gap）
    var move  = step * 2;             // 一次滚两张
    var max   = maxScroll();
    var left  = rail.scrollLeft;
    // 剩余空间不够两张 → 跳回起点
    // behavior: "instant" 跳过浏览器 smooth scroll 动画（~600ms），
    // 让总节奏 ≈ FC_INTERVAL 准确可控，不会让用户感觉"远不止 4 秒"
    if (left + move >= max - 2) {
      rail.scrollTo({ left: 0, behavior: "instant" });
    } else {
      rail.scrollBy({ left: move, behavior: "instant" });
    }
  }

  function fcStart() {
    fcStop();
    if (fcPause || !rail) return;
    fcTimer = setInterval(fcAutoNext, FC_INTERVAL);
  }
  function fcStop() {
    if (fcTimer) { clearInterval(fcTimer); fcTimer = null; }
  }

  // 页面切到后台时停掉，省 CPU / 避免回到前台后跳一帧
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) fcStop();
    else fcStart();
  });

  if (rail && btnPrev && btnNext) {
    btnPrev.addEventListener("click", function () {
      rail.scrollBy({ left: -stepWidth(), behavior: "smooth" });
      fcStart();  // 重置计时器
    });
    btnNext.addEventListener("click", function () {
      rail.scrollBy({ left:  stepWidth(), behavior: "smooth" });
      fcStart();  // 重置计时器
    });
    rail.addEventListener("scroll", updateNavState, { passive: true });
    window.addEventListener("resize", updateNavState);
    // hover 时暂停
    rail.addEventListener("mouseenter", function () { fcPause = true;  fcStop(); });
    rail.addEventListener("mouseleave", function () { fcPause = false; fcStart(); });
    // 初始状态 + 启动自动滚动
    setTimeout(function () { updateNavState(); fcStart(); }, 60);
  }

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
