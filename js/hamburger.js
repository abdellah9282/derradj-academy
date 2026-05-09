/**
 * hamburger.js – Derradj Academy
 * Auto-injects:
 *   1. Mobile hamburger menu (nav drawer)
 *   2. WhatsApp floating button (replaces .support-icon)
 */
(function () {
  function init() {
    injectHamburger();
    injectWhatsApp();
  }

  /* ── Hamburger menu ─────────────────────────────────────── */
  function injectHamburger() {
    var header = document.querySelector('header.main-header');
    if (!header) return;

    var nav = header.querySelector('nav.right-links');
    if (!nav) return;

    // Skip if already initialised
    if (header.querySelector('.hamburger-btn')) return;

    // 1. Create hamburger button
    var btn = document.createElement('button');
    btn.className = 'hamburger-btn';
    btn.setAttribute('aria-label', 'فتح القائمة');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';
    header.insertBefore(btn, nav);

    // 2. Mark nav for CSS targeting
    if (!nav.id) nav.id = 'mainNav';
    nav.classList.add('nav-mobile-ready');

    // 3. Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    document.body.appendChild(overlay);

    function openMenu() {
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      nav.classList.add('mobile-open');
      overlay.classList.add('active');
      document.body.classList.add('no-scroll');
    }

    function closeMenu() {
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('mobile-open');
      overlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      nav.classList.contains('mobile-open') ? closeMenu() : openMenu();
    });

    overlay.addEventListener('click', closeMenu);

    nav.querySelectorAll('a').forEach(function (link) {
      if (link.href.indexOf('wa.me') === -1) {
        link.addEventListener('click', closeMenu);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ── WhatsApp floating button ───────────────────────────── */
  function injectWhatsApp() {
    // Skip if a wa.me link already exists in the page
    if (document.querySelector('a[href*="wa.me"]')) return;

    var wa = document.createElement('a');
    wa.href = 'https://wa.me/213555491316';
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    wa.setAttribute('aria-label', 'تواصل معنا عبر واتساب');
    wa.className = 'wa-float-btn';
    wa.innerHTML =
      '<img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" width="26" height="26">' +
      '<span>تواصل معنا</span>';

    document.body.appendChild(wa);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
