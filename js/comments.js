// ------------------------------------------------------------
// 🔥 DEBUG – تأكيد تحميل السكربت
// ------------------------------------------------------------
console.log("🔥 comments.js loaded successfully");


// ------------------------------------------------------------
// ✔ تحميل Supabase (ESM)
// ------------------------------------------------------------
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// إنشاء عميل Supabase
const supabase = createClient(
  "https://sgcypxmnlyiwljuqvcup.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM"
);


// ------------------------------------------------------------
// 🔍 جلب التعليقات
// ------------------------------------------------------------
async function fetchModernComments() {
  console.log("📥 بدء جلب التعليقات...");

  const container = document.getElementById("modern-comments-container");

  if (!container) {
    console.error("❌ ERROR: لم يتم العثور على عنصر modern-comments-container");
    return;
  }

  // تنظيف القديم
  container.innerHTML = "<p>⏳ جاري تحميل التعليقات...</p>";

  const { data, error } = await supabase
    .from("course_ratings")
    .select("id, comment, full_name, module, created_at")
    .neq("comment", "")
    .not("comment", "is", null)
    .order("created_at", { ascending: false });

  // طباعة الأخطاء
  console.log("⚠️ error:", error);
  console.log("📦 data:", data);

  if (error) {
    container.innerHTML = "<p>⚠️ حدث خطأ أثناء تحميل التعليقات.</p>";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>لا توجد تعليقات بعد.</p>";
    return;
  }

  container.innerHTML = ""; // إفراغ الرسالة واستقبال التعليقات

  // إنشاء عناصر التعليقات
  data.forEach(({ comment, full_name, module }) => {
    const card = document.createElement("div");
    card.className = "comment-card-modern";

    const initial = full_name?.charAt(0)?.toUpperCase() || "?";
    const moduleFormatted = module?.replace(/_/g, " ") || "";
    const short = comment.length > 120 ? comment.slice(0, 120) + "..." : comment;

    // اكتشاف اتجاه اللغة
    const isArabic = /[\u0600-\u06FF]/.test(comment);
    const dir = isArabic ? "rtl" : "ltr";

    card.innerHTML = `
      <div class="comment-header">
        <div class="comment-avatar">${initial}</div>
        <div class="comment-name">${full_name}
          <span style="color:#6b7280;">(${moduleFormatted})</span>
        </div>
      </div>
      <div class="comment-body" dir="${dir}">
        ${short}
      </div>
    `;

    container.appendChild(card);
  });

  console.log(`✅ تم عرض ${data.length} تعليقًا`);
}


// ------------------------------------------------------------
// ✔ تشغيل جلب التعليقات بعد تحميل الصفحة بالكامل
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("🌐 DOM جاهز — بدء جلب التعليقات");
  fetchModernComments();
});
