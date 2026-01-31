import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* -------------------------------------------------------------------------- */
/* 🔐 Supabase config */
/* -------------------------------------------------------------------------- */
const SUPABASE_URL = "https://sgcypxmnlyiwljuqvcup.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* -------------------------------------------------------------------------- */
/* ⚙️ Commissions */
/* -------------------------------------------------------------------------- */
const FIXED_COMMISSION = 400;
const COURSE_PERCENTAGE = 0.20; // للمواد
const BUNDLE_PERCENTAGE = 0.10; // للباقات (اخترتها أنا)

/* -------------------------------------------------------------------------- */
/* 📚 Courses map (السعر ثابت عندك) */
/* -------------------------------------------------------------------------- */
const COURSES = {
  // 📦 Bundles
  bundle_second_year: { name: "باقة السنة الثانية – 6 مواد", price: 4990, type: "bundle" },
  bundle_third_year: { name: "باقة السنة الثالثة – 4 مواد", price: 3500, type: "bundle" },

  // 📚 Courses
  math3_analyse3: { name: "Math 3 – Analyse 3", price: 1200, type: "course" },
  machine_electrique: { name: "Machine Électrique", price: 1200, type: "course" },
  ondes_et_vibrations: { name: "Ondes et Vibrations", price: 1500, type: "course" },
  electrotechnique_fondamentale1: { name: "Électrotechnique Fondamentale 1", price: 1500, type: "course" },
  electronique_fondamentale1: { name: "Électronique Fondamentale 1", price: 1500, type: "course" },
  les_quadripoles: { name: "Les Quadripôles", price: 1000, type: "course" },
  theorie_du_champ: { name: "Théorie du Champ Électromagnétique", price: 800, type: "course" },
  informatique01: { name: "Informatique 1", price: 1000, type: "course" },
  informatique02: { name: "Informatique 2 (Pascal)", price: 1000, type: "course" },
  informatique03: { name: "Informatique 3 (MATLAB)", price: 1000, type: "course" },
  electronique_de_puissance: { name: "Électronique de Puissance (avancée)", price: 1500, type: "course" },
  probabilite_et_statistique: { name: "Probabilité et Statistique", price: 1000, type: "course" },
  logique_combinatoire_et_sequentielle: { name: "Logique Combinatoire et Séquentielle", price: 1000, type: "course" },
  methodes_numeriques: { name: "Méthodes Numériques L2+M1", price: 1200, type: "course" },
  systeme_asservis: { name: "Systèmes Asservis", price: 1200, type: "course" },
  reseaux_electrique: { name: "Réseaux Électriques", price: 1200, type: "course" },
  theorie_du_signal: { name: "Théorie du Signal", price: 800, type: "course" },
};

/* -------------------------------------------------------------------------- */
/* 💰 حساب العمولة حسب القواعد التي حددتها أنت */
/* -------------------------------------------------------------------------- */
function calcCommission(price, type) {
  // ✅ الباقات: ثابت
  if (type === "bundle") {
    return 500;
  }

  // ✅ المواد: نفس منطق 1500 => 400
  // نحسب بنفس النسبة
  const ratio = 400 / 1500; // ≈ 0.266666
  return Math.round(price * ratio);
}

/* -------------------------------------------------------------------------- */
/* 👀 Preview الربح (المبلغ فقط) */
/* -------------------------------------------------------------------------- */
const courseSelect = document.getElementById("courseKey");
const commissionPreview = document.getElementById("commissionPreview");

if (courseSelect && commissionPreview) {
  courseSelect.addEventListener("change", () => {
    const course = COURSES[courseSelect.value];
    if (!course) {
      commissionPreview.value = "اختر المادة لعرض الربح";
      return;
    }
    const commission = calcCommissionByRules(course.price, course.type);
    commissionPreview.value = `+${commission} دج`;
  });
}

/* -------------------------------------------------------------------------- */
/* 🔐 Simple gate (أنت أصلاً تخزّن userToken/userContact بعد Auth) */
/* -------------------------------------------------------------------------- */
const agentContact = localStorage.getItem("userContact");
const userToken = localStorage.getItem("userToken");
if (!agentContact || userToken !== "ok") {
  window.location.href = "../login.html";
}

/* -------------------------------------------------------------------------- */
/* 🧩 DOM */
/* -------------------------------------------------------------------------- */
const form = document.getElementById("addClientForm");
const tableBody = document.querySelector("#clientsTable tbody");
const buyersList = document.getElementById("buyersList");
const totalEarningsEl = document.getElementById("totalEarnings");
const statusMessage = document.getElementById("statusMessage");

/* -------------------------------------------------------------------------- */
/* 🧮 Helpers */
/* -------------------------------------------------------------------------- */
function calcCommissionByRules(price, type) {
  // ✅ الباقات
  if (type === "bundle") return 500;

  // ✅ المواد (بنفس النسبة انطلاقًا من 1500 -> 400)
  const ratio = 400 / 1500; // 0.266666...
  return Math.round(price * ratio);
}

function badgeHTML(isApproved) {
  if (isApproved === true) return `<span class="badge approved">✅ مقبول</span>`;
  if (isApproved === false) return `<span class="badge rejected">❌ مرفوض</span>`;
  return `<span class="badge pending">⏳ قيد المراجعة</span>`;
}

function showStatus(text, color = "black", timeout = 0) {
  statusMessage.textContent = text;
  statusMessage.style.color = color;
  statusMessage.style.display = "block";
  if (timeout > 0) setTimeout(() => (statusMessage.style.display = "none"), timeout);
}

/* -------------------------------------------------------------------------- */
/* ➕ Submit (Pending فقط) */
/* -------------------------------------------------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const clientName = form.clientName.value.trim();
  const clientPhone = form.clientPhone.value.trim();
  const courseKey = form.courseKey.value;
  const notes = form.notes?.value?.trim() || "";

  if (!clientName || !clientPhone || !courseKey) {
    showStatus("❌ أدخل الاسم + الهاتف + اختر المادة", "red", 2500);
    return;
  }

  const course = COURSES[courseKey];
  if (!course) {
    showStatus("❌ مادة غير صالحة", "red", 2500);
    return;
  }

  const commission = calcCommission(course.price, course.type);

  const { error } = await supabase.from("student_clients").insert({
    agent_contact: agentContact,   // ربط العملية بالمسوّق
    client_name: clientName,
    client_phone: clientPhone,

    course_key: courseKey,
    course_name: course.name,
    course_price: course.price,
    course_type: course.type,

    commission,                   // محسوبة تلقائياً
    notes,
    is_approved: null,            // ⏳ Pending حتى توافق أنت
  });

  if (error) {
    console.error("Insert error:", error);
    showStatus("❌ حدث خطأ أثناء الإرسال", "red", 2500);
    return;
  }

  form.reset();
  showStatus("✅ تم الإرسال (في انتظار الموافقة)", "green", 2200);
  await loadData();
});

/* -------------------------------------------------------------------------- */
/* 📥 Load */
/* -------------------------------------------------------------------------- */
async function loadData() {
  const { data, error } = await supabase
    .from("student_clients")
    .select("*")
    .eq("agent_contact", agentContact)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load error:", error);
    showStatus("❌ فشل تحميل البيانات", "red", 2500);
    return;
  }

  const rows = data || [];
  renderTable(rows);
  renderApprovedStats(rows);
}

/* -------------------------------------------------------------------------- */
/* 🧾 Table render */
/* -------------------------------------------------------------------------- */
function renderTable(rows) {
  tableBody.innerHTML = "";

  if (!rows.length) {
    tableBody.innerHTML =
      `<tr><td colspan="6" style="text-align:center;">لا توجد عمليات بعد</td></tr>`;
    return;
  }

  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.client_name || "-"}</td>
      <td>${r.client_phone || "-"}</td>
      <td>
        ${r.course_name || "-"}
        <div style="font-size:12px;color:#6b7280;">${Number(r.course_price || 0)} دج</div>
      </td>
      <td style="color:#16a34a;font-weight:800;">+${Number(r.commission || 0)} دج</td>
      <td>${new Date(r.created_at).toLocaleString("fr-FR")}</td>
      <td>${badgeHTML(r.is_approved)}</td>
    `;
    tableBody.appendChild(tr);
  });
}

/* -------------------------------------------------------------------------- */
/* 📊 Approved-only earnings */
/* -------------------------------------------------------------------------- */
function renderApprovedStats(rows) {
  buyersList.innerHTML = "";

  const approved = rows.filter((r) => r.is_approved === true);
  let totalApproved = 0;

  if (!approved.length) {
    buyersList.innerHTML =
      `<li style="text-align:center;color:#888;">لا توجد أرباح مؤكدة بعد</li>`;
    totalEarningsEl.textContent = `0 دج`;
    return;
  }

  approved.forEach((r) => {
    totalApproved += Number(r.commission || 0);

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="buyer-name">${r.client_name || "-"}</div>
      <div class="buyer-email">${r.course_name || "-"}</div>
      <div class="buyer-amount">+${Number(r.commission || 0)} دج</div>
      <div class="buyer-date">🕒 ${new Date(r.created_at).toLocaleString("fr-FR")}</div>
    `;
    buyersList.appendChild(li);
  });

  totalEarningsEl.textContent = `${totalApproved} دج`;
}

/* -------------------------------------------------------------------------- */
/* 🚀 Init */
/* -------------------------------------------------------------------------- */
window.addEventListener("DOMContentLoaded", loadData);
