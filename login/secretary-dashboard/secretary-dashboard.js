import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* -------------------------------------------------------------------------- */
/* 🔹 إنشاء اتصال آمن مع قاعدة البيانات Supabase */
/* -------------------------------------------------------------------------- */
const SUPABASE_URL = "https://sgcypxmnlyiwljuqvcup.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getCalledStudents() {
  return JSON.parse(localStorage.getItem('called_students') || '[]');
}

function saveCalledStudent(phone) {
  const list = getCalledStudents();
  if (!list.includes(phone)) {
    list.push(phone);
    localStorage.setItem('called_students', JSON.stringify(list));
  }
}

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
  hideStatus();
}

/* -------------------------------------------------------------------------- */
/* 🧾 عرض الرسائل */
/* -------------------------------------------------------------------------- */
function renderMessages(messages) {
  messagesTable.innerHTML = "";

  if (!messages || messages.length === 0) {
    messagesTable.innerHTML =
      `<tr><td colspan="5" style="text-align:center;">🎉 لا توجد رسائل جديدة</td></tr>`;
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
  document.querySelectorAll(".copyBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const phone = btn.dataset.phone;
      navigator.clipboard.writeText(phone);
      showStatus(`📞 تم نسخ رقم الهاتف: ${phone}`, "blue", 1500);
    });
  });

  document.querySelectorAll(".reviewBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("هل أنت متأكد أنك راجعت هذه الرسالة؟")) return;

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
      await loadStats();
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 🧮 تحميل الإحصائيات (الأرباح والمجموع) */
/* -------------------------------------------------------------------------- */
async function loadStats() {
  try {
    const { data, error } = await supabase
      .from("messages")
.select(`
  name,
  email,
  created_at,
  orientation_200,
  orientation_sami_100,
  confirmation_100,
  appels_20,
  pack_three_modules_300,
  year_one_200,
  year_two_500,
  year_three_300,
  extra_amount
`)
;


    if (error) throw error;

    const buyersData = [];
    let totalEarnings = 0;

    for (const row of data) {
      let personEarnings = 0;

      // 🟦 حساب كل الأعمدة الديناميكية حسب السعر داخل اسم العمود
      const pricingMap = {
        orientation_200: 200,
        orientation_sami_100: 100,
        confirmation_100: 100,
        appels_20: 20,
        pack_three_modules_300: 300,
        year_one_200: 200,
        year_two_500: 500,
        year_three_300: 300
      };

      for (const key in pricingMap) {
        if (row[key] === true) {
          personEarnings += pricingMap[key];
        }
      }
// 🟧 إضافة المبلغ اليدوي
personEarnings += row.extra_amount || 0;

      if (personEarnings > 0) {
        totalEarnings += personEarnings;
buyersData.push({
  name: row.name || "بدون اسم",
  email: row.email || "غير متوفر",
  amount: personEarnings,
  date: row.created_at   // ⭐ نضيف التاريخ
});

      }
    }

    updateStats({ buyersData, totalEarnings });

  } catch (err) {
    console.error("❌ خطأ أثناء حساب الإحصائيات:", err);
    showStatus("حدث خطأ أثناء حساب الإحصائيات.", "red", 3000);
  }
}

/* -------------------------------------------------------------------------- */
/* 🖥️ عرض الأشخاص والمجموع في الأسفل */
/* -------------------------------------------------------------------------- */
function updateStats({ buyersData, totalEarnings }) {
  const buyersEarningsEl = document.getElementById("buyersEarnings");
  const buyersList = document.getElementById("buyersList");

  if (buyersEarningsEl)buyersEarningsEl.textContent = `${totalEarnings} دج`;


  if (!buyersList) return;
  buyersList.innerHTML = "";

  if (buyersData.length === 0) {
    buyersList.innerHTML = `<li style="text-align:center; color:#888;">لا يوجد أشخاص حصلوا على أرباح</li>`;
    return;
  }

  // ⭐⭐⭐ ترتيب حسب التاريخ من الأحدث للأقدم
  buyersData.sort((a, b) => new Date(b.date) - new Date(a.date));

buyersData.forEach((buyer) => {
  const formattedDate = new Date(buyer.date).toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  const li = document.createElement("li");
  li.innerHTML = `
    <strong>${buyer.name}</strong>
    <span style="color:#2563eb;"> - ${buyer.email}</span>
    <span style="float:right; color:#16a34a;">+${buyer.amount} دج</span>
    <div style="font-size:12px; color:#555; margin-top:4px;">🕒 ${formattedDate}</div>
  `;
  buyersList.appendChild(li);
});

const totalLi = document.createElement("li");
totalLi.style.cssText = `
  margin-top: 14px;
  background: #ecfdf5;
  border: 2px solid #a7f3d0;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #065f46;

  /* ⭐ أهم شيء لمنع النزول للسطر */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
`;

totalLi.innerHTML = `
  <span>💰</span>
  <span style="color:#059669; font-weight:800;">${totalEarnings} دج</span>:
    <span>المجموع الكلي </span>

`;

buyersList.appendChild(totalLi);

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
/* 📞 طلبة Machine Electrique و Math 3 (من جدول registrations) */
/* -------------------------------------------------------------------------- */

async function loadMachineAndMath3Students() {
  const { data, error } = await supabase
    .from('registrations')
    .select('full_name, contact, modules, created_at')
    .eq('is_approved', true)
    .is('is_teacher', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ خطأ في تحميل الطلبة:', error);
    showStatus('❌ فشل تحميل طلبة المواد.', 'red', 3000);
    return;
  }

  renderMachineAndMath3Students(data);
}
const calledSet = new Set(getCalledStudents());

function renderMachineAndMath3Students(students) {
  const tableBody = document.querySelector('#studentsTable tbody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  let hasAny = false;

  students.forEach(student => {
    if (!student.modules) return;

    // تجاهل أرقام النظام
    if (student.contact && student.contact.startsWith('039333')) return;

    let modules = [];
    if (Array.isArray(student.modules)) {
      modules = student.modules;
    } else if (typeof student.modules === 'string') {
      try {
        modules = JSON.parse(student.modules);
      } catch {
        modules = student.modules.split(',');
      }
    }

    const hasMachine = modules.includes('machine_electrique');
    const hasMath3 =
      modules.includes('math3_analyse3') ||
      modules.includes('math3_sami_braci') ||
      modules.includes('math_3');

    if (!hasMachine && !hasMath3) return;

    hasAny = true;

    const moduleNames = [];
    if (hasMachine) moduleNames.push('Machine Électrique');
    if (hasMath3) moduleNames.push('Math 3');

    const tr = document.createElement('tr');
 tr.innerHTML = `
  <td class="student-name">${student.full_name || 'غير معروف'}</td>
  <td class="student-phone">${student.contact || '-'}</td>
  <td class="student-module">${moduleNames.join(' , ')}</td>
  <td>
    <button class="copyBtn" data-phone="${student.contact}" type="button">
      📋 نسخ
    </button>
    <button class="callBtn" data-phone="${student.contact}" type="button">
      📞 تم الاتصال
    </button>
  </td>
`;

/* ✅⭐ هنا الحل ⭐✅ */
if (student.contact && calledSet.has(String(student.contact).trim())) {
  tr.classList.add('called');

  const callBtn = tr.querySelector('.callBtn');
  if (callBtn) {
    callBtn.textContent = '✅ تم الاتصال';
    callBtn.disabled = true;
  }
}

tableBody.appendChild(tr);

  });

  if (!hasAny) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;color:#777;">
          لا يوجد طلبة مسجلين في Machine Électrique أو Math 3
        </td>
      </tr>
    `;
  }

  // زر النسخ
  document.querySelectorAll('.copyBtn').forEach(btn => {
    btn.onclick = () => {
      navigator.clipboard.writeText(btn.dataset.phone);
      showStatus('📞 تم نسخ رقم الهاتف', 'green', 1500);
    };
  });
}
let selectedRow = null;
let selectedPhone = null;

document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('callBtn')) return;

  selectedRow = e.target.closest('tr');
  selectedPhone = selectedRow.querySelector('.student-phone')?.textContent;

  document.getElementById('callModal').style.display = 'flex';
});

document.getElementById('confirmCall').onclick = () => {
  if (!selectedRow || !selectedPhone) return;

  saveCalledStudent(selectedPhone);

  selectedRow.style.opacity = '0.4';
  selectedRow.style.textDecoration = 'line-through';

  const btn = selectedRow.querySelector('.callBtn');
  if (btn) {
    btn.textContent = '✅ تم الاتصال';
    btn.disabled = true;
  }

  closeModal();
};

document.getElementById('cancelCall').onclick = closeModal;

function closeModal() {
  document.getElementById('callModal').style.display = 'none';
  selectedRow = null;
  selectedPhone = null;
}


/* -------------------------------------------------------------------------- */
/* 🚀 عند التحميل */
/* -------------------------------------------------------------------------- */
window.addEventListener("DOMContentLoaded", async () => {
  await loadMessages();
  await loadStats();
 await loadMachineAndMath3Students(); // ✅ إضافة

});
