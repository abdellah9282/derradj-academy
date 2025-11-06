import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔹 إنشاء اتصال مع قاعدة البيانات في Supabase
const supabase = createClient(
  "https://sgcypxmnlyiwljuqvcup.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM"
);

// ✅ السماح فقط لرقم محدد بالدخول إلى الصفحة
const allowedPhone = "0776922882"; // رقم السكرتيرة المصرح به

// 🔹 جلب رقم الهاتف من localStorage
const loggedPhone = localStorage.getItem("userContact");

// 🔒 تحقق من مطابقة الرقم
if (loggedPhone !== allowedPhone) {
  // 🚫 منع الوصول وإعادة التوجيه
  window.location.href = "../login.html";
}


const messagesTable = document.getElementById("messagesTable").querySelector("tbody");
const statusMessage = document.getElementById("statusMessage");

// 📨 تحميل الرسائل من قاعدة البيانات (فقط غير المراجعة)
async function loadMessages() {
  statusMessage.textContent = "⏳ جارٍ تحميل الرسائل...";
  statusMessage.style.color = "gray";

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .is("is_reviewed", null) // ✅ جلب فقط الرسائل التي لم تُراجع بعد
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading messages:", error);
    statusMessage.textContent = "❌ فشل تحميل الرسائل.";
    statusMessage.style.color = "red";
    return;
  }

  messagesTable.innerHTML = "";

  if (!data || data.length === 0) {
    messagesTable.innerHTML = `<tr><td colspan="5" style="text-align:center;">🎉 لا توجد رسائل جديدة</td></tr>`;
    statusMessage.textContent = "";
    return;
  }

  // ✅ عرض الرسائل في الجدول
  data.forEach(msg => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${msg.name || "غير معروف"}</td>
      <td>${msg.contact || msg.email || "-"}</td>
      <td>${msg.message || "-"}</td>
      <td>${new Date(msg.created_at).toLocaleString()}</td>
      <td>
        <button class="copyBtn" data-phone="${msg.contact || msg.email}">📋 نسخ رقم الهاتف</button>
        <button class="reviewBtn" data-id="${msg.id}">✅ تمت المراجعة</button>
      </td>
    `;
    messagesTable.appendChild(row);
  });

  // تفعيل الأزرار
  addActionListeners();
}

// ⚙️ التعامل مع الأزرار
function addActionListeners() {
  // 🔹 زر نسخ رقم الهاتف
  document.querySelectorAll(".copyBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const phone = btn.dataset.phone;
      navigator.clipboard.writeText(phone);
      alert("📋 تم نسخ رقم الهاتف: " + phone);
    });
  });

  // ✅ زر "تمت المراجعة"
  document.querySelectorAll(".reviewBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      const confirmAction = confirm("هل أنت متأكد أنك راجعت هذه الرسالة؟");
      if (!confirmAction) return;

      // ✅ تحديث is_reviewed من NULL إلى TRUE في Supabase
      const { error } = await supabase
        .from("messages")
        .update({ is_reviewed: true })
        .eq("id", id)
        .is("is_reviewed", null); // 🔒 تأكد أنه كان null قبل التحديث

      if (error) {
        console.error("❌ خطأ في تحديث الحالة:", error);
        alert("حدث خطأ أثناء تحديث حالة الرسالة.");
        return;
      }

      // 🧹 إزالة الرسالة من الجدول مباشرة
      btn.closest("tr").remove();

      // ✅ إشعار نجاح
      statusMessage.textContent = "✅ تم تحويل حالة الرسالة إلى (تمت المراجعة).";
      statusMessage.style.color = "green";
      statusMessage.style.display = "block";

      // إخفاء الإشعار بعد ثانيتين
      setTimeout(() => {
        statusMessage.style.display = "none";
      }, 2000);
    });
  });
}

// 🚀 تشغيل عند تحميل الصفحة
window.addEventListener("DOMContentLoaded", loadMessages);
