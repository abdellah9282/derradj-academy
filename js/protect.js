// protect.js – Advanced Silent DevTools Blocker

(function () {
  // 🔒 منع الزر الأيمن
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // 🔒 منع اختصارات أدوات المطور
  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (
      key === "f12" ||
      (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) ||
      (e.ctrlKey && key === "u") ||
      (e.metaKey && e.altKey && key === "i")
    ) {
      e.preventDefault();
      return false;
    }
  });

  // 🔒 كشف فتح DevTools عبر الفروقات في الحجم
  setInterval(() => {
    if (
      window.outerHeight - window.innerHeight > 160 ||
      window.outerWidth - window.innerWidth > 160
    ) {
      document.body.innerHTML = `
        <div style="text-align:center; margin-top:20vh; font-family:sans-serif; color:#b91c1c; font-size:1.6rem;">
          🚨 تم اكتشاف أدوات المطور! الوصول ممنوع.
        </div>`;
    }
  }, 1000);

  // 🔒 تعطيل أدوات النسخ والقص واللصق والسحب
  ["copy", "cut", "paste", "dragstart"].forEach(evt => {
    document.addEventListener(evt, (e) => e.preventDefault());
  });

  // 🛡️ إزالة console.log بالكامل (تعطيل التفتيش من خلالها)
  console.log = function () {};
  console.clear();
  console.warn = function () {};
  console.info = function () {};
})();
// 🔒 منع حفظ الصفحة عبر Ctrl + S
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    return false;
  }
});
