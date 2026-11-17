/* 全站交互：滚动渐显、导航收起、栏目筛选。
   没有它页面依然可读（noscript 里有降级样式），只是少了动画和筛选。 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 滚动渐显 ---- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.dataset.revealed = 'true'; });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.dataset.revealed = 'true';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach(function (el) { io.observe(el); });
  }

  /* ---- 导航 ---- */
  var nav = document.getElementById('siteNav');
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var lastY = window.scrollY;
  var menuOpen = false;

  function syncNav() {
    if (!nav) return;
    var y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 120);
    var hiding = y > lastY && y > 260 && !menuOpen;
    nav.classList.toggle('is-hidden', hiding);
    lastY = y;
  }
  if (nav) {
    window.addEventListener('scroll', syncNav, { passive: true });
    syncNav();
  }

  function setMenu(open) {
    if (!mobileMenu || !navToggle) return;
    menuOpen = open;
    mobileMenu.hidden = !open;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.textContent = open ? '关闭' : '目录';
    if (nav) { nav.classList.remove('is-hidden'); }
    if (open) {
      var first = mobileMenu.querySelector('a');
      if (first) first.focus();
    }
  }
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () { setMenu(mobileMenu.hidden); });
    Array.prototype.forEach.call(mobileMenu.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('click', function (e) {
      if (!menuOpen) return;
      if (mobileMenu.contains(e.target) || navToggle.contains(e.target)) return;
      setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 880 && menuOpen) setMenu(false);
      syncNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) { setMenu(false); navToggle.focus(); }
    });
  }

  /* ---- 手记筛选 ---- */
  var pills = Array.prototype.slice.call(document.querySelectorAll('.pill'));
  var noteCards = Array.prototype.slice.call(document.querySelectorAll('.lab[data-category]'));
  var noteCount = document.getElementById('noteCount');

  function applyFilter(value) {
    pills.forEach(function (p) {
      var on = p.dataset.filter === value;
      p.classList.toggle('active', on);
      p.setAttribute('aria-pressed', String(on));
    });
    var shown = 0;
    noteCards.forEach(function (card) {
      var visible = value === 'all' || card.dataset.category === value;
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    if (noteCount) noteCount.textContent = '显示 ' + shown + ' / ' + noteCards.length + ' 篇';
  }

  if (pills.length && noteCards.length) {
    pills.forEach(function (p) {
      p.addEventListener('click', function () { applyFilter(p.dataset.filter); });
    });
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-filter-card], [data-filter-link]'),
      function (el) {
        el.addEventListener('click', function () {
          applyFilter(el.dataset.filterCard || el.dataset.filterLink);
        });
      }
    );
  }
})();