/* 全站交互：滚动渐显、Dock 亚克力态、移动端目录、栏目筛选、回到顶部、页内目录高亮。
   没有它页面依然可读（noscript 里有降级样式），只是少了动画和筛选。
   配色切换（自动 / 浅色 / 深色）已随「全站只保留浅色」整段下线，本站不再读写
   任何配色偏好，也不存在图片配色副本的换源逻辑。 */
(function () {
  'use strict';

  /* 减弱动效偏好（prefers-reduced-motion）完全由 CSS 负责，见 atelier.css 里
     @media (prefers-reduced-motion:reduce) 那条块：html{scroll-behavior:auto} 让程序化
     滚动退化为瞬移，[data-reveal] 直接显形并去掉过渡。JS 这边不再读该偏好。 */

  /* 起跳阈值按元素自身高度分档，不一刀切 12%：.sys-gate（h=1242）/ .sys-veto .panel（h=901）
     这类高块按 12% 要先滚进自身 12% 才显形（1242 的那块即 149px，再叠 -6% 的 rootMargin 更晚），
     快速下滚时先看到一整块空白再蹦出内容。高过 60% 视口的块改用 threshold 0（进屏即起跳，
     实测两块都在进屏 58px 时显形），矮块保留 12% 原手感。高度在挂观察器时量一次
     （内容后续被图片撑高的块，触发点会略偏晚，不影响最终显形）。 */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var REVEAL_RATIO = 0.12;
  var TALL_FRAC = 0.6;
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.dataset.revealed = 'true'; });
  } else {
    revealItems.forEach(function (el) {
      var h = el.getBoundingClientRect().height || 1;
      var t = h > window.innerHeight * TALL_FRAC ? 0 : REVEAL_RATIO;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          /* 双条件：isIntersecting 在某些浏览器的首帧回调里只看「有没有相交」，
             不看阈值，补一道 ratio 判断保证按 t 起跳 */
          if (entry.isIntersecting && entry.intersectionRatio >= t) {
            entry.target.dataset.revealed = 'true';
            io.disconnect();
          }
        });
      }, { threshold: t, rootMargin: '0px 0px -6% 0px' });
      io.observe(el);
    });
  }

  /* ---- Dock：常驻顶栏，只做「贴住视口顶之后转亚克力」这一件事 ----
     阈值 = .topbar 的实测高度（1440 视口量得 37.8px：padding 10px 0 + 10.5px 字体约 16px
     行高 + 1px 底线）。原先写死 36，落在「还没贴住视口顶、却已经切亚克力」的区间，
     y=36/37 时 Dock 距贴顶还剩 1.8px / 0.8px 缝，出现 1px 级接缝闪动。顶栏高度随断点变，
     所以量出来用，并在 resize 时重算；取不到（窄屏 .topbar 退场、高度为 0）就退回 38。
     滚动方向判定与「收起 / 展开」逻辑已删：Dock 永不消失，pointer-events 永不为 none。 */
  var nav = document.getElementById('siteNav');
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var topbar = document.querySelector('.topbar');
  var dockEdge = 38;
  var menuOpen = false;

  function measureDockEdge() {
    if (!topbar) return;
    var h = topbar.getBoundingClientRect().height;
    if (h > 0) dockEdge = h;
  }
  function syncNav() {
    if (!nav) return;
    nav.classList.toggle('is-acrylic', window.scrollY > dockEdge);
  }
  if (nav) {
    measureDockEdge();
    window.addEventListener('scroll', syncNav, { passive: true });
    /* 断点切换会改 .topbar 的 padding，阈值跟着重量一次 */
    window.addEventListener('resize', function () { measureDockEdge(); syncNav(); });
    syncNav();
  }

  function setMenu(open) {
    if (!mobileMenu || !navToggle) return;
    menuOpen = open;
    mobileMenu.hidden = !open;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.textContent = open ? '关闭' : '目录';
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

  /* ---- 项目筛选 ---- */
  var pills = Array.prototype.slice.call(document.querySelectorAll('.pill'));
  var noteCards = Array.prototype.slice.call(document.querySelectorAll('.lab[data-category]'));
  var noteCount = document.getElementById('noteCount');
  /* 量词写在计数区或其容器上（data-count-unit），缺省「个」；首页项目网格写「个」 */
  var countUnit = '个';
  if (noteCount) {
    var unitHost = noteCount.closest('[data-count-unit]');
    if (!unitHost) unitHost = document.querySelector('[data-count-unit]');
    if (unitHost && unitHost.getAttribute('data-count-unit')) {
      countUnit = unitHost.getAttribute('data-count-unit');
    }
  }

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
    if (noteCount) noteCount.textContent = '显示 ' + shown + ' / ' + noteCards.length + ' ' + countUnit;
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

  /* ---- 回到顶部 ----
     .top-sentinel 是 .shell 内一根 100vh 高的透明哨兵，铺在页面最顶。
     它还在视口里 = 还没滚过一屏 = 按钮不出现；离开视口才浮现。
     全程不用 scroll 监听。按钮 HTML 初值带 hidden（加载瞬间不闪），
     本模块确认 IntersectionObserver 可用后才摘掉 hidden，之后显隐交给 .is-visible
     ——基态用 visibility/opacity 藏，所以摘掉 hidden 不会让它凭空出现。
     没有 IO、或本页根本没有 .to-top（404 / 不足一屏的页）时整段静默跳过。 */
  var toTop = document.querySelector('.to-top');
  var sentinel = document.querySelector('.top-sentinel');
  if (toTop && sentinel && ('IntersectionObserver' in window)) {
    toTop.removeAttribute('hidden');
    new IntersectionObserver(function (entries) {
      toTop.classList.toggle('is-visible', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
    toTop.addEventListener('click', function () {
      /* 不传 behavior：按 CSSOM-View，缺省值 auto 会取滚动容器（html）的
         scroll-behavior 计算值 —— 平滑或瞬移由 atelier.css 的媒体查询决定 */
      window.scrollTo({ top: 0 });
      var main = document.getElementById('main');
      if (main) {
        main.tabIndex = -1;
        main.focus({ preventScroll: true });
      }
    });
  }

  /* ---- 页内目录高亮（只有挂了 .page-toc 的三级长页会命中）----
     观察每个 section[id]，把「标题刚滚过 Dock 下沿」的那一节标成当前项。 */
  var toc = document.querySelector('.page-toc');
  if (toc && ('IntersectionObserver' in window)) {
    var tocLinks = {};
    Array.prototype.forEach.call(toc.querySelectorAll('a[href^="#"]'), function (a) {
      tocLinks[a.getAttribute('href').slice(1)] = a;
    });
    var currentId = null;
    var markCurrent = function (id) {
      if (currentId === id) return;
      if (tocLinks[currentId]) tocLinks[currentId].classList.remove('is-current');
      currentId = id;
      if (tocLinks[currentId]) tocLinks[currentId].classList.add('is-current');
    };
    var tocObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) markCurrent(entry.target.id);
      });
    }, { rootMargin: '-112px 0px -60% 0px', threshold: 0 });
    Object.keys(tocLinks).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) tocObserver.observe(section);
    });
  }
})();
