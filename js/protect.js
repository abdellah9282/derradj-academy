/**
 * protect.js — Derradj Academy Protection Layer v2.0
 * يُطبَّق على جميع صفحات mycourses-board
 *
 * ⚠️  صادقية تقنية:
 *  - كل الحمايات الأمامية (Frontend) هي رادع وليست جدارًا حقيقيًا.
 *  - الحماية الحقيقية = Supabase RLS + Session Guard في course.js.
 *  - مطوّر محترف يستطيع تجاوز هذا الملف، لكن المستخدم العادي لا يستطيع.
 */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════
  // 1. CSS — تعطيل تحديد النص والطباعة
  // ══════════════════════════════════════════════════════
  var style = document.createElement('style');
  style.textContent = [
    '*, *::before, *::after {',
    '  -webkit-user-select: none !important;',
    '  -moz-user-select: none !important;',
    '  -ms-user-select: none !important;',
    '  user-select: none !important;',
    '  -webkit-user-drag: none !important;',
    '}',
    'input, textarea, [contenteditable="true"] {',
    '  -webkit-user-select: text !important;',
    '  user-select: text !important;',
    '}',
    '@media print {',
    '  html, body { display: none !important; visibility: hidden !important; }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // ══════════════════════════════════════════════════════
  // 2. KEYBOARD — منع الاختصارات الخطرة
  // ══════════════════════════════════════════════════════
  // المجموعات المحظورة (Ctrl/Cmd + مفتاح):
  var CTRL_BLOCKED = {
    'u': 1,   // View Source
    's': 1,   // Save Page
    'p': 1,   // Print
    'a': 1,   // Select All
  };
  // Ctrl + Shift + مفتاح:
  var CTRL_SHIFT_BLOCKED = {
    'i': 1,   // DevTools Elements
    'j': 1,   // DevTools Console
    'c': 1,   // DevTools Inspect
    'k': 1,   // DevTools Console (Firefox)
    'e': 1,   // Network (Firefox)
    'm': 1,   // Memory
  };

  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();

    // F12
    if (k === 'f12') {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl/Cmd + Shift + [blocked]
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && CTRL_SHIFT_BLOCKED[k]) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl/Cmd + [blocked]
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && CTRL_BLOCKED[k]) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }

    // Alt + F4 لا نمنعه (إغلاق التطبيق = حق المستخدم)
  }, true); // capture=true: يعمل قبل أي listener آخر في الصفحة

  // ══════════════════════════════════════════════════════
  // 3. CONTEXT MENU — منع الزر الأيمن
  // ══════════════════════════════════════════════════════
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }, true);

  // ══════════════════════════════════════════════════════
  // 4. CLIPBOARD & DRAG — منع النسخ والسحب
  // ══════════════════════════════════════════════════════
  ['copy', 'cut', 'dragstart', 'selectstart'].forEach(function (evt) {
    document.addEventListener(evt, function (e) {
      // السماح داخل حقول الإدخال فقط
      var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea') return;
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);
  });

  // ══════════════════════════════════════════════════════
  // 5. CONSOLE — إخفاء المعلومات التشخيصية
  //    ⚠️ رادع فقط: أي مطوّر يستطيع إعادة console من DevTools
  // ══════════════════════════════════════════════════════
  var noop = function () {};
  ['log', 'warn', 'info', 'error', 'debug', 'table', 'dir', 'trace', 'group', 'groupEnd'].forEach(function (m) {
    try { console[m] = noop; } catch (_) {}
  });
  try { console.clear(); } catch (_) {}

  // ══════════════════════════════════════════════════════
  // 6. تحديد الصفحات المحمية
  //
  //  صفحات مستثناة من الكشف (عامة - لا تحتاج حماية DevTools):
  //    /login/login.html، /sign-up/، /index.html، /blocked.html
  //
  //  ⚠️ تنبيه: فتح DevTools من قائمة المتصفح (ثلاث نقاط)
  //  لا يمكن منعه بـ JavaScript — هذا قيد المتصفح نفسه.
  //  ما يلي يكتشف DevTools المفتوحة ويُخرج المستخدم.
  // ══════════════════════════════════════════════════════
  var _path = window.location.pathname;

  var _EXCLUDED = [
    'login.html',
    'sign-up',
    'blocked.html',
    'session_conflict',
    'terms.html',
    'how-to-register',
    'index.html'
  ];

  var _isExcluded = _EXCLUDED.some(function (p) {
    return _path.indexOf(p) !== -1;
  });

  // تُطبَّق على كل صفحة محمية ليست في القائمة المستثناة
  var _isProtectedPage = !_isExcluded && _path !== '/';

  var _dtOpen = false;
  var _dtThreshold = 160;

  function _checkDevToolsSize() {
    if (!_isProtectedPage) return;
    var wDiff = window.outerWidth  - window.innerWidth;
    var hDiff = window.outerHeight - window.innerHeight;
    if (wDiff > _dtThreshold || hDiff > _dtThreshold) {
      if (!_dtOpen) {
        _dtOpen = true;
        _handleViolation();
      }
    } else {
      _dtOpen = false;
    }
  }

  // ══════════════════════════════════════════════════════
  // 7. DEBUGGER TRAP — يكتشف DevTools عبر التأخر في التنفيذ
  //    ⚠️ رادع فقط: يمكن تجاوزه بـ "Deactivate breakpoints"
  // ══════════════════════════════════════════════════════
  var _lastDebuggerCheck = 0;

  function _debuggerTrap() {
    if (!_isProtectedPage) return;
    var now = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    var elapsed = performance.now() - now;
    if (elapsed > 100 && (now - _lastDebuggerCheck) > 1500) {
      _lastDebuggerCheck = now;
      _handleViolation();
    }
  }

  // فحص فوري عند التحميل + دوري
  _checkDevToolsSize();
  setInterval(_checkDevToolsSize, 800);
  setInterval(_debuggerTrap, 3000);

  // ══════════════════════════════════════════════════════
  // 8. VIOLATION HANDLER — ردة الفعل على المخالفة
  // ══════════════════════════════════════════════════════
  var _violated = false;

  function _handleViolation() {
    if (_violated) return;
    _violated = true;
    try { localStorage.clear(); } catch (_) {}
    window.location.replace('/blocked.html');
  }

  // ══════════════════════════════════════════════════════
  // 9. منع Ctrl+S من قائمة المتصفح — تُغطيها المجموعة في القسم 2
  // ══════════════════════════════════════════════════════

})();
