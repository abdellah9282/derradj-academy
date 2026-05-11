// protect.js – Advanced Silent DevTools Blocker

(function () {

  // 🏴 نظام تتبع محاولات التجاوز
  let devViolations = 0;

  // 🔒 منع الزر الأيمن
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // 🔒 منع اختصارات أدوات المطور وحفظ الصفحة وعرض مصدرها
  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    const isEditable = e.target.isContentEditable ||
      ["input", "textarea"].includes(e.target.tagName.toLowerCase());

    // أدوات المطور – تُمنع دائماً بصرف النظر عن موضع التركيز
    if (
      key === "f12" ||
      (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) ||
      (e.metaKey && e.altKey && key === "i")
    ) {
      e.preventDefault();
      devViolations += 2;
      return false;
    }

    // Ctrl+S / Cmd+S – حفظ الصفحة، يُمنع دائماً
    if ((e.ctrlKey || e.metaKey) && key === "s") {
      e.preventDefault();
      return false;
    }

    // Ctrl+U / Cmd+U – عرض مصدر الصفحة، لا يُطبَّق داخل حقول الإدخال
    if (!isEditable && (e.ctrlKey || e.metaKey) && key === "u") {
      e.preventDefault();
      devViolations += 2;
      return false;
    }
  });

  // 🔒 تعطيل النسخ والقص واللصق والسحب خارج حقول الإدخال
  ["copy", "cut", "paste", "dragstart"].forEach(evt => {
    document.addEventListener(evt, (e) => {
      const isEditable = e.target.isContentEditable ||
        ["input", "textarea"].includes(e.target.tagName.toLowerCase());
      if (!isEditable) e.preventDefault();
    });
  });

  // 🛡️ تعطيل console
  console.log  = function () {};
  console.warn = function () {};
  console.info = function () {};
  console.clear();

})();
