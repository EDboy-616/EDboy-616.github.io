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

  /* ---- 配色切换：自动 / 浅色 / 深色 ---- */
  var root = document.documentElement;
  var themeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-theme-set]'));
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  var plates = Array.prototype.slice.call(document.querySelectorAll('img[src*="assets/img/"]'));
  var themePref = root.getAttribute('data-theme-pref') || 'auto';
  var themeReady = false;

  plates.forEach(function (img) {
    if (!img.getAttribute('data-src-base')) {
      img.setAttribute('data-src-base', img.getAttribute('src'));
    }
  });

  function systemTheme() {
    return systemDark.matches ? 'dark' : 'light';
  }

  function resolvedTheme(pref) {
    return pref === 'dark' || (pref === 'auto' && systemDark.matches) ? 'dark' : 'light';
  }

  function markThemeReady() {
    if (themeReady) return;
    themeReady = true;
    root.setAttribute('data-theme-ready', '');
  }

  function syncPlates(variant) {
    var pending = 0;
    plates.forEach(function (img) {
      var base = img.getAttribute('data-src-base');
      if (!base) return;
      var next = variant === 'auto' ? base : base.replace(/\.svg$/, '-' + variant + '.svg');
      if (img.getAttribute('src') === next) return;
      var wait = img.complete && img.naturalWidth > 0;
      if (wait) pending += 1;
      function done() {
        if (!wait) return;
        wait = false;
        pending -= 1;
        if (pending === 0) markThemeReady();
      }
      if (wait) {
        img.addEventListener('load', done);
        img.addEventListener('error', done);
        setTimeout(done, 4000);
      }
      img.setAttribute('src', next);
    });
    if (pending === 0) markThemeReady();
  }

  function applyTheme(pref, persist) {
    themePref = pref;
    var theme = resolvedTheme(pref);
    var variant = pref !== 'auto' && theme !== systemTheme() ? theme : 'auto';
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-theme-pref', pref);
    if (variant === 'auto') {
      root.removeAttribute('data-theme-swap');
    } else {
      root.setAttribute('data-theme-swap', '');
    }
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#14120e' : '#f4edda');
    }
    themeButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-theme-set') === pref));
    });
    syncPlates(variant);
    if (persist) {
      try { localStorage.setItem('edboy-theme', pref); } catch (e) {}
    }
  }

  themeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyTheme(btn.getAttribute('data-theme-set'), true);
    });
  });

  function onSystemChange() {
    applyTheme(themePref, false);
  }
  if (systemDark.addEventListener) {
    systemDark.addEventListener('change', onSystemChange);
  } else if (systemDark.addListener) {
    systemDark.addListener(onSystemChange);
  }

  applyTheme(themePref, false);
})();