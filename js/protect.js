// protect.js – Smart Behavioral Security Layer v2.0
// نظام حماية ذكي بنقاط متدرجة – لا يؤثر على المستخدمين العاديين

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // الإعدادات
  // ─────────────────────────────────────────────────────────────
  var CFG = {
    warnThreshold:   4,    // نقاط لأول تحذير خفيف
    alertThreshold:  7,    // نقاط للتحذير الثاني
    actionThreshold: 10,   // نقاط للتقييد المؤقت
    decayMs:         30000, // كل 30 ثانية تنقص نقطة واحدة
    actionDuration:  30,   // ثواني فترة التقييد
    logKey:          'da_sec_log',
    maxLogs:         50,
  };

  // ─────────────────────────────────────────────────────────────
  // الحالة الداخلية
  // ─────────────────────────────────────────────────────────────
  var score          = 0;
  var warnShown      = false;
  var alertShown     = false;
  var actionActive   = false;
  var devtoolsStreak = 0;

  // ─────────────────────────────────────────────────────────────
  // التسجيل الداخلي (localStorage)
  // ─────────────────────────────────────────────────────────────
  function logEvent(evt, pts) {
    try {
      var arr = JSON.parse(localStorage.getItem(CFG.logKey) || '[]');
      arr.push({
        time:  new Date().toISOString(),
        page:  location.pathname,
        event: evt,
        pts:   pts,
        score: score
      });
      if (arr.length > CFG.maxLogs) arr.shift();
      localStorage.setItem(CFG.logKey, JSON.stringify(arr));
    } catch (_) {}
  }

  // ─────────────────────────────────────────────────────────────
  // محرك النقاط
  // ─────────────────────────────────────────────────────────────
  function addScore(evt, pts) {
    score += pts;
    logEvent(evt, pts);
    react();
  }

  // تناقص تلقائي للنقاط مع الوقت
  setInterval(function () {
    if (score > 0) {
      score = Math.max(0, score - 1); // 1 نقطة كل 30 ثانية
      if (score < CFG.warnThreshold)   { warnShown  = false; alertShown = false; }
      if (score < CFG.actionThreshold) { actionActive = false; }
    }
  }, CFG.decayMs);

  // ─────────────────────────────────────────────────────────────
  // ردود الفعل المتدرجة
  // ─────────────────────────────────────────────────────────────
  function react() {
    if (score >= CFG.actionThreshold && !actionActive) {
      actionActive = true;
      showOverlay();
    } else if (score >= CFG.alertThreshold && !alertShown) {
      alertShown = true;
      showToast('⚠️ تم رصد نشاط مشبوه متكرر. الاستمرار قد يؤدي إلى تقييد الوصول.', 'alert');
    } else if (score >= CFG.warnThreshold && !warnShown) {
      warnShown = true;
      showToast('هذه الصفحة محمية. بعض الأدوات غير مسموح باستخدامها.', 'warn');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // واجهة: إشعار Toast
  // ─────────────────────────────────────────────────────────────
  function showToast(msg, type) {
    function create() {
      var old = document.getElementById('da-sec-toast');
      if (old) old.remove();

      var el = document.createElement('div');
      el.id = 'da-sec-toast';
      el.style.cssText = [
        'position:fixed', 'bottom:22px', 'right:22px',
        'z-index:2147483646',
        'background:' + (type === 'alert' ? '#c0392b' : '#d35400'),
        'color:#fff', 'padding:12px 18px', 'border-radius:9px',
        'font-family:Arial,sans-serif', 'font-size:14px', 'font-weight:bold',
        'box-shadow:0 4px 18px rgba(0,0,0,.4)', 'max-width:300px',
        'direction:rtl', 'line-height:1.55',
        'opacity:0', 'transition:opacity .35s ease',
        'pointer-events:none'
      ].join(';');
      el.textContent = msg;
      document.body.appendChild(el);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.style.opacity = '1'; });
      });
      var delay = type === 'alert' ? 5500 : 3500;
      setTimeout(function () {
        el.style.opacity = '0';
        setTimeout(function () { el.remove(); }, 400);
      }, delay);
    }
    if (document.body) { create(); }
    else { document.addEventListener('DOMContentLoaded', create); }
  }

  // ─────────────────────────────────────────────────────────────
  // واجهة: Overlay تقييد مؤقت
  // ─────────────────────────────────────────────────────────────
  function showOverlay() {
    if (document.getElementById('da-sec-overlay')) return;

    function create() {
      var overlay = document.createElement('div');
      overlay.id = 'da-sec-overlay';
      overlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:2147483647',
        'background:rgba(8,8,8,.96)',
        'display:flex', 'flex-direction:column',
        'align-items:center', 'justify-content:center',
        'font-family:Arial,sans-serif', 'direction:rtl',
        'user-select:none'
      ].join(';');
      overlay.innerHTML =
        '<div style="font-size:54px;margin-bottom:14px">&#128274;</div>' +
        '<div style="color:#fff;font-size:22px;font-weight:bold;margin-bottom:10px">' +
          'تم تقييد وصولك مؤقتاً' +
        '</div>' +
        '<div style="color:#aaa;font-size:15px;text-align:center;max-width:340px;line-height:1.65">' +
          'تم رصد نشاط غير طبيعي متكرر على هذه الصفحة.<br>سيُرفع التقييد خلال:' +
        '</div>' +
        '<div id="da-sec-cd" style="color:#e74c3c;font-size:46px;font-weight:bold;margin-top:18px">' +
          CFG.actionDuration +
        '</div>' +
        '<div style="color:#555;font-size:13px;margin-top:6px">ثانية</div>';

      document.body.appendChild(overlay);

      var n = CFG.actionDuration;
      var timer = setInterval(function () {
        n--;
        var cd = document.getElementById('da-sec-cd');
        if (cd) cd.textContent = n;
        if (n <= 0) {
          clearInterval(timer);
          overlay.remove();
          // إعادة تعيين الحالة بعد انتهاء فترة التقييد
          score       = 0;
          warnShown   = false;
          alertShown  = false;
          actionActive = false;
        }
      }, 1000);
    }

    if (document.body) { create(); }
    else { document.addEventListener('DOMContentLoaded', create); }
  }

  // ─────────────────────────────────────────────────────────────
  // مساعد: هل الهدف حقل إدخال؟
  // ─────────────────────────────────────────────────────────────
  function isInputTarget(e) {
    var tag = ((e.target && e.target.tagName) || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || !!(e.target && e.target.isContentEditable);
  }

  // ─────────────────────────────────────────────────────────────
  // حراسة لوحة المفاتيح (useCapture = true للاعتراض المبكر)
  // ─────────────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    var k    = e.key.toLowerCase();
    var ctrl = e.ctrlKey || e.metaKey;

    // F12 – أدوات المطور
    if (k === 'f12') {
      e.preventDefault();
      addScore('F12', 2);
      return;
    }

    // Ctrl+Shift+I – فتح DevTools
    if (ctrl && e.shiftKey && k === 'i') {
      e.preventDefault();
      addScore('Ctrl+Shift+I', 2);
      return;
    }

    // Ctrl+Shift+J – Console
    if (ctrl && e.shiftKey && k === 'j') {
      e.preventDefault();
      addScore('Ctrl+Shift+J', 2);
      return;
    }

    // Ctrl+Shift+C – Inspector (ليس Ctrl+C العادي)
    if (ctrl && e.shiftKey && k === 'c') {
      e.preventDefault();
      addScore('Ctrl+Shift+C', 2);
      return;
    }

    // Ctrl+U – عرض المصدر
    if (ctrl && !e.shiftKey && k === 'u') {
      e.preventDefault();
      addScore('Ctrl+U', 2);
      return;
    }

    // Ctrl+S – حفظ الصفحة
    if (ctrl && k === 's') {
      e.preventDefault();
      addScore('Ctrl+S', 1);
      return;
    }

    // Ctrl+P – طباعة/حفظ PDF
    if (ctrl && k === 'p') {
      e.preventDefault();
      addScore('Ctrl+P', 1);
      return;
    }

    // Ctrl+C و Ctrl+V العاديان: مسموح تماماً بدون أي إجراء
    // (معالجة copy/cut events أدناه تتولى حماية محتوى الصفحة)

  }, true);

  // ─────────────────────────────────────────────────────────────
  // حماية محتوى الصفحة من النسخ (مسموح داخل حقول الإدخال)
  // ─────────────────────────────────────────────────────────────
  document.addEventListener('copy', function (e) {
    if (isInputTarget(e)) return; // مسموح في input/textarea
    e.preventDefault();
    addScore('copy-page', 0.5);
  });

  document.addEventListener('cut', function (e) {
    if (isInputTarget(e)) return;
    e.preventDefault();
    addScore('cut-page', 0.5);
  });

  // ─────────────────────────────────────────────────────────────
  // منع القائمة السياقية (كليك يمين)
  // ─────────────────────────────────────────────────────────────
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    addScore('right-click', 0.3);
  });

  // ─────────────────────────────────────────────────────────────
  // منع السحب خارج حقول الإدخال
  // ─────────────────────────────────────────────────────────────
  document.addEventListener('dragstart', function (e) {
    if (isInputTarget(e)) return;
    e.preventDefault();
    addScore('drag', 0.3);
  });

  // ─────────────────────────────────────────────────────────────
  // كشف DevTools عبر أبعاد النافذة (محافظ – لا يُفعّل بمفرده)
  // يتطلب 4 قراءات متتالية (~8 ثوانٍ) لتسجيل نقطة واحدة فقط
  // ─────────────────────────────────────────────────────────────
  setInterval(function () {
    var wDiff = window.outerWidth  - window.innerWidth;
    var hDiff = window.outerHeight - window.innerHeight;
    // عتبة 220px تستبعد أشرطة المتصفح العادية (~80-120px)
    if (wDiff > 220 || hDiff > 220) {
      devtoolsStreak++;
      if (devtoolsStreak >= 4) {
        addScore('devtools-size', 0.5);
        devtoolsStreak = 0;
      }
    } else {
      devtoolsStreak = 0;
    }
  }, 2000);

  // ─────────────────────────────────────────────────────────────
  // تعطيل console (بعد تهيئة النظام)
  // ─────────────────────────────────────────────────────────────
  var noop = function () {};
  try {
    console.log   = noop;
    console.warn  = noop;
    console.info  = noop;
    console.debug = noop;
    console.dir   = noop;
    console.table = noop;
    console.clear();
  } catch (_) {}

})();
