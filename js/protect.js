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
