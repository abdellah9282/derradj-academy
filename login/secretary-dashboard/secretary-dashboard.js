import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* -------------------------------------------------------------------------- */
/* 🔹 إنشاء اتصال آمن مع قاعدة البيانات Supabase */
/* -------------------------------------------------------------------------- */
const SUPABASE_URL = "https://sgcypxmnlyiwljuqvcup.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* -------------------------------------------------------------------------- */
/* ✅ السماح فقط لرقم محدد بالدخول */
/* -------------------------------------------------------------------------- */
const allowedPhone = "0776922882";
const loggedPhone = localStorage.getItem("userContact");
if (loggedPhone !== allowedPhone) {
  window.location.href = "../login.html";
}

/* -------------------------------------------------------------------------- */
/* 🧩 عناصر الصفحة */
/* -------------------------------------------------------------------------- */
const messagesTable = document.querySelector("#messagesTable tbody");
const statusMessage = document.getElementById("statusMessage");

/* -------------------------------------------------------------------------- */
/* 📨 تحميل الرسائل غير المراجعة */
/* -------------------------------------------------------------------------- */
async function loadMessages() {
  showStatus("⏳ جارٍ تحميل الرسائل...", "gray");

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .is("is_reviewed", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ خطأ في تحميل الرسائل:", error);
    showStatus("❌ فشل تحميل الرسائل.", "red");
    return;
  }

  renderMessages(data);

  // ✅ بعد تحميل الرسائل بنجاح، أخفِ رسالة الحالة بعد ثانيتين
  if (data && data.length > 0) {
    setTimeout(() => hideStatus(), 2000);
  } else {
    hideStatus(); // لو مافيش بيانات أصلاً، نخفيها فوراً
  }
}


/* -------------------------------------------------------------------------- */
/* 🧾 عرض الرسائل */
/* -------------------------------------------------------------------------- */
function renderMessages(messages) {
  messagesTable.innerHTML = "";

  if (!messages || messages.length === 0) {
    messagesTable.innerHTML = `<tr><td colspan="5" style="text-align:center;">🎉 لا توجد رسائل جديدة</td></tr>`;
    hideStatus();
    return;
  }

  for (const msg of messages) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${msg.name || "غير معروف"}</td>
      <td>${msg.contact || msg.email || "-"}</td>
      <td>${msg.message || "-"}</td>
      <td>${new Date(msg.created_at).toLocaleString()}</td>
      <td>
        <button class="copyBtn" data-phone="${msg.contact || msg.email}">📋 نسخ</button>
        <button class="reviewBtn" data-id="${msg.id}">✅ تمت المراجعة</button>
      </td>
    `;
    messagesTable.appendChild(row);
  }

  initButtons();
}

/* -------------------------------------------------------------------------- */
/* ⚙️ إعداد الأزرار */
/* -------------------------------------------------------------------------- */
function initButtons() {
  // ☎️ زر النسخ
  document.querySelectorAll(".copyBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const phone = btn.dataset.phone;
      navigator.clipboard.writeText(phone);
      showStatus(`📞 تم نسخ رقم الهاتف: ${phone}`, "blue", 1500);
    });
  });

  // ✅ زر "تمت المراجعة"
  document.querySelectorAll(".reviewBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirmAction = confirm("هل أنت متأكد أنك راجعت هذه الرسالة؟");
      if (!confirmAction) return;

      const { error } = await supabase
        .from("messages")
        .update({ is_reviewed: true })
        .eq("id", id)
        .is("is_reviewed", null);

      if (error) {
        console.error("❌ خطأ في التحديث:", error);
        showStatus("حدث خطأ أثناء تحديث الرسالة.", "red");
        return;
      }

      btn.closest("tr").remove();
      showStatus("✅ تم وضع الرسالة كمراجَعة.", "green", 2000);

      // بعد المراجعة، حدث الإحصائيات
      await loadStats();
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 🧮 تحميل الإحصائيات */
/* -------------------------------------------------------------------------- */
async function loadStats() {
  try {
    // عدد الرسائل التي تمت مراجعتها (is_reviewed = TRUE)
    const { count: reviewedCount, error: reviewedError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("is_reviewed", true);
    if (reviewedError) throw reviewedError;

    // عدد المشترين (buy = TRUE)
const { data: buyersData, count: buyersCount, error: buyersError } = await supabase
  .from("messages")
  .select("name, email", { count: "exact" })
  .eq("buy", true);

    if (buyersError) throw buyersError;

    // حساب الأرباح
    const callEarnings = reviewedCount * 30; // 30 دج لكل مراجعة
    const buyEarnings = buyersCount * 200;   // 200 دج لكل شراء
    const totalEarnings =  buyEarnings;

    // تحديث الصفحة
    updateStats({
      calls: reviewedCount,
      callEarnings,
      buyersCount,
      buyEarnings,
      totalEarnings,
      buyersData
    });
  } catch (err) {
    console.error("❌ خطأ أثناء حساب الإحصائيات:", err);
  }
}

/* -------------------------------------------------------------------------- */
/* 🖥️ عرض الإحصائيات */
/* -------------------------------------------------------------------------- */
function updateStats({ calls, callEarnings, buyersCount, buyEarnings, totalEarnings, buyersData }) {
  const callsCount = document.getElementById("callsCount");
  const callsCost = document.getElementById("callsCost");
  const buyersTotalEl = document.getElementById("buyersTotal"); // العنصر الجديد في الهيدر
  const buyersEarningsEl = document.getElementById("buyersEarnings"); // مجموع الأرباح الكلي
  const buyersList = document.getElementById("buyersList");

  // 📞 عدد الاتصالات
  if (callsCount) callsCount.textContent = calls;
  // 💸 تكلفة الاتصالات
  if (callsCost) callsCost.textContent = callEarnings + " دج";
  // 🧍‍♀️ مجموع أرباح المشترين فقط (كل واحد 200 دج)
  if (buyersTotalEl) buyersTotalEl.textContent = buyEarnings + " دج";
  // 💰 الأرباح الكلية (اتصالات + مشتريات)
  if (buyersEarningsEl) buyersEarningsEl.textContent = totalEarnings + " دج";

  // 👥 قائمة المشترين المقنعين (الاسم + الهاتف)
  if (buyersList) {
    buyersList.innerHTML = "";
    buyersData.forEach(buyer => {
      const li = document.createElement("li");
      const name = buyer.name || "بدون اسم";
      const phone = buyer.email || "غير متوفر";
      li.innerHTML = `
        <strong>${name}</strong>
        <span style="color:#2563eb; font-weight:500;"> - ${phone}</span>
      `;
      buyersList.appendChild(li);
    });
  }
}


/* -------------------------------------------------------------------------- */
/* 🔔 أدوات مساعدة */
/* -------------------------------------------------------------------------- */
function showStatus(text, color = "black", timeout = 0) {
  statusMessage.textContent = text;
  statusMessage.style.color = color;
  statusMessage.style.display = "block";
  if (timeout > 0) setTimeout(() => hideStatus(), timeout);
}

function hideStatus() {
  statusMessage.style.display = "none";
}

/* -------------------------------------------------------------------------- */
/* 🚀 عند التحميل */
/* -------------------------------------------------------------------------- */
window.addEventListener("DOMContentLoaded", async () => {
  await loadMessages();
  await loadStats();
});
