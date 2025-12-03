import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ✅ إنشاء عميل Supabase
const supabase = createClient(
  'https://sgcypxmnlyiwljuqvcup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM'
);

// ✅ خريطة أسماء المواد
function formatSubjectName(code) {
  const map = {
    'theorie_du_champ': 'Théorie du Champ Électromagnétique',
'math3_sami_braci': 'Math 3 – Analyse 3 (Sami Braci)',
'math3_analyse3': 'Math 3 – Analyse 3',

    'ondes_et_vibrations': 'Ondes et Vibrations',
    'electronique_fondamentale1': 'Électronique Fondamentale 1',
    'electrotechnique_fondamentale1': 'Électrotechnique Fondamentale 1',
    'electricite_industrielle': 'Électricité Industrielle',
    'electronique_de_puissance': 'Électronique de Puissance',
    'informatique01': 'Informatique 1',
    'informatique02': 'Informatique 2 (Pascal)',
    'informatique03': 'Informatique 3 (MATLAB)',
    'logique': 'Logique Combinatoire et Séquentielle',
    'methode': 'Méthodes Numériques L2+M1',
    'probabilite_et_statistique': 'Probabilité et Statistique',
    'reseaux_electrique': 'Réseaux Électriques',
    'systeme_asservis': 'Systèmes Asservis',
    'theorie_du_signal': 'Théorie du Signal',
    'traitement_du_signal': 'Traitement du Signal',
    'etat_de_l_art': 'État de l’art',
    'machines_electriques': 'Machines Électriques',
    'commandes_machines_electriques': 'Commandes des Machines Électriques',
    'mesures_electriques_et_electroniques': 'Mesures Électriques et Électroniques',
    'bundle_second_year': 'باقة السنة الثانية (5 مواد)',
    'bundle_third_year': 'باقة السنة الثالثة (4 مواد)',
    'bundle_first_year': 'باقة السنة الأولى (3 مواد)',

  };
  return map[code] || code;
}

// ✅ الأسعار
const subjectPrices = {
  'math3_analyse3': 1200,
  'math3_sami_braci': 2000,
  'ondes_et_vibrations': 1500,
  'electrotechnique_fondamentale1': 1500,
  'electronique_fondamentale1': 1500,
  'theorie_du_champ_electromagnetique': 800,
  'informatique01': 1000,
  'informatique02': 1000,
  'informatique03': 1000,
  'electronique_de_puissance': 1500,
  'probabilite_et_statistique': 1000,
  'logique': 1000,
  'methode': 1200,
  'systeme_asservis': 1200,
  'reseaux_electrique': 1200,
  'theorie_du_signal': 800,
  'theorie_du_champ': 800,
  'etat_de_l_art': 2500,
  'machines_electriques': 2500,
  'commandes_machines_electriques': 2500,
  'mesures_electriques_et_electroniques': 2500,
  'math_3': 2000,
  'bundle_second_year': 5000,
  'bundle_third_year': 3500,
  'math1': 1300,
  'physique1': 1300,
  'chimie1': 1300,
  'math2' : 1300,
  'bundle_first_year': 5000,
  'physique2': 1300
};

// ✅ جلب مواد الأستاذ
async function fetchTeacherModules() {
  const teacherContact = localStorage.getItem('userContact');
  if (!teacherContact) {
    document.getElementById('subjectsList').innerHTML = '<li>Please login first.</li>';
    return null;
  }

  const { data, error } = await supabase
    .from('registrations')
    .select('modules')
    .eq('contact', teacherContact)
    .eq('is_teacher', true)
    .single();

  if (error) {
    console.error('Error fetching teacher modules:', error);
    document.getElementById('subjectsList').innerHTML = '<li>Error loading subjects.</li>';
    return null;
  }

  if (!data.modules) {
    document.getElementById('subjectsList').innerHTML = '<li>No subjects assigned.</li>';
    return null;
  }

  if (typeof data.modules === 'string') {
    try {
      return JSON.parse(data.modules);
    } catch {
      console.warn('Failed to parse modules JSON string');
      return [];
    }
  } else if (Array.isArray(data.modules)) {
    return data.modules;
  }
  return [];
}

// ✅ تعريف الباقات
const bundleSecond = [
  'ondes_et_vibrations',
  'electrotechnique_fondamentale1',
  'electronique_fondamentale1',
  'informatique03',
  'probabilite_et_statistique'
];
const bundleThird = [
  'theorie_du_champ',
  'electronique_de_puissance',
  'systeme_asservis',
  'reseaux_electrique'
];
const bundleFirst = [
  'math1',
  'chimie1',
  'physique1'
];

// ✅ دالة لجلب كل الطلاب (تتجاوز حد 100)
async function fetchAllApprovedStudents() {
  const all = [];
  let from = 0;
  const limit = 100;
  let done = false;

  while (!done) {
    const { data, error } = await supabase
      .from('registrations')
      .select('contact, modules')
      .eq('is_approved', true)
      .is('is_teacher', null)
      .range(from, from + limit - 1);

    if (error) {
      console.error('Error fetching students batch:', error);
      break;
    }

    if (data.length === 0) {
      done = true;
    } else {
      all.push(...data);
      from += limit;
    }
  }

  return all;
}
function getTeacherUnitPrice(subject, teacherContact) {

  // 🟣 Math 3 – Sami Braci (تقسيم 1000 / 1000)
  if (subject === 'math3_sami_braci') {
    if (teacherContact === '0555491316') return 1000;
    if (teacherContact === '0552329993') return 1000;
    return 0;
  }

  const fullPriceSubjects = ['math1', 'physique1', 'chimie1', 'math2', 'physique2'];

  if (subject === 'bundle_first_year') {
    if (teacherContact === '0555491316') return 1700;
    if (teacherContact === '0552329993') return 3300;
    return 0;
  }

  if (fullPriceSubjects.includes(subject)) {
    if (teacherContact === '0552329993') return 1300;
    return 700;
  }

  return subjectPrices[subject] || 0;
}





// ✅ الدالة لحساب الأرباح لكل أستاذ
async function calculateTeacherEarnings(subjects, teacherContact) {
  if (!subjects || subjects.length === 0) return { counts: {}, total: 0 };

  const students = await fetchAllApprovedStudents();

  const counts = {};
  let totalEarnings = 0;

  for (const subj of subjects) counts[subj] = 0;

  for (const student of students || []) {
    if (!student.modules) continue;

    // 🚫 تجاهل السطر الذي contact يبدأ بـ "039333"
    if (student.contact && student.contact.startsWith('039333')) continue;

    let modules = [];
    if (Array.isArray(student.modules)) {
      modules = student.modules;
    } else if (typeof student.modules === 'string') {
      try {
        modules = JSON.parse(student.modules);
      } catch {
        modules = [];
      }
    }

    if (!modules || modules.length === 0) continue;

const hasSecondBundle = bundleSecond.every(m => modules.includes(m));
const hasThirdBundle  = bundleThird.every(m => modules.includes(m));
const hasFirstBundle  = bundleFirst.every(m => modules.includes(m));

// ✅ حساب الباقات
if (teacherContact === '0555491316' || teacherContact === '0552329993') {

  // باقة السنة الأولى: مشتركة بين الأستاذين مع سعر مختلف
  if (hasFirstBundle) {
    const bundlePrice =
      teacherContact === '0555491316'
        ? 1700   // حسابك أنت
        : 3300;  // حساب الأستاذ 0552329993

    counts['bundle_first_year'] = (counts['bundle_first_year'] || 0) + 1;
    totalEarnings += bundlePrice;
    continue; // لا نحسب المواد منفردة في حالة الباقة
  }

  // ✅ باقي الباقات (السنة الثانية والثالثة) تبقى خاصة بـ 0555491316 فقط
  if (teacherContact === '0555491316') {
    if (hasSecondBundle) {
      counts['bundle_second_year'] = (counts['bundle_second_year'] || 0) + 1;
      totalEarnings += 5000;
      continue;
    }

    if (hasThirdBundle) {
      counts['bundle_third_year'] = (counts['bundle_third_year'] || 0) + 1;
      totalEarnings += 3500;
      continue;
    }
  }
}



    for (const subj of subjects) {
      if (modules.includes(subj)) {
        counts[subj] = (counts[subj] || 0) + 1;
totalEarnings += getTeacherUnitPrice(subj, teacherContact);
      }
    }
  }

  return { counts, total: totalEarnings };
}

// ====== Helpers: last-30-days income aggregation and charting ======
function getLastNDates(n) {
  const dates = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(d);
  }
  return dates;
}

function formatDateKey(d) {
  return d.toISOString().slice(0, 10);
}

function formatDayMonth(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

function daysForRangeOption(option) {
  if (!option) return 30;
  if (option === 'all') return 'all';
  const n = Number(option);
  if (isNaN(n) || n <= 0) return 30;
  return n;
}

async function fetchIncomeForRange(rangeOption, teacherContact, teacherModules) {
  let days = daysForRangeOption(rangeOption);
  // cap max days for 'all' to 365 to keep chart reasonable
  if (days === 'all') days = 365;

  const dates = getLastNDates(days);
  const labels = dates.map(d => formatDayMonth(d));
  const map = {};
  dates.forEach(d => (map[formatDateKey(d)] = 0));

  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startISO = start.toISOString();

  // 1) payments table (preferred)
  try {
    const { data: payments, error: payError } = await supabase
      .from('payments')
      .select('amount,created_at,teacher_contact,modules')
      .gte('created_at', startISO);

    if (!payError && payments && payments.length > 0) {
      for (const p of payments) {
        if (p.teacher_contact && teacherContact && p.teacher_contact !== teacherContact) continue;
        if (p.modules && Array.isArray(p.modules) && teacherModules && teacherModules.length) {
          const relevant = p.modules.some(m => teacherModules.includes(m));
          if (!relevant) continue;
        }
        const key = p.created_at ? p.created_at.slice(0, 10) : null;
        if (key && map[key] !== undefined) map[key] += Number(p.amount || 0);
      }
      return { labels, amounts: Object.keys(map).map(k => map[k]) };
    }
  } catch (e) {
    console.warn('Payments query failed, falling back to registrations:', e);
  }

  // 2) fallback to registrations
  try {
    const { data: regs, error: regsError } = await supabase
      .from('registrations')
      .select('modules,created_at,contact')
      .gte('created_at', startISO)
      .eq('is_approved', true)
      .is('is_teacher', null);

    if (!regsError && regs && regs.length > 0) {
      for (const r of regs) {
        if (r.contact && r.contact.startsWith('039333')) continue;
        let modules = [];
        if (Array.isArray(r.modules)) modules = r.modules;
        else if (typeof r.modules === 'string') {
          try { modules = JSON.parse(r.modules); } catch { modules = r.modules.split(','); }
        }
        const common = modules.filter(m => teacherModules.includes(m));
        if (!common || common.length === 0) continue;

        // Apply bundle detection logic (same as calculateTeacherEarnings)
        let amount = 0;
        const hasSecondBundle = bundleSecond.every(m => modules.includes(m));
        const hasThirdBundle = bundleThird.every(m => modules.includes(m));
        const hasFirstBundle = bundleFirst.every(m => modules.includes(m));

        if (teacherContact === '0555491316' || teacherContact === '0552329993') {
          if (hasFirstBundle) {
            // First year bundle pricing
            amount = (teacherContact === '0555491316') ? 1700 : 3300;
          } else if (teacherContact === '0555491316') {
            // Second and third bundles only for 0555491316
            if (hasSecondBundle) {
              amount = 5000;
            } else if (hasThirdBundle) {
              amount = 3500;
            } else {
              // Individual module pricing
              for (const m of common) amount += getTeacherUnitPrice(m, teacherContact) || 0;
            }
          } else {
            // Other teachers: individual pricing
            for (const m of common) amount += getTeacherUnitPrice(m, teacherContact) || 0;
          }
        } else {
          // Other teachers: individual pricing
          for (const m of common) amount += getTeacherUnitPrice(m, teacherContact) || 0;
        }

        const key = r.created_at ? r.created_at.slice(0, 10) : null;
        if (key && map[key] !== undefined) map[key] += amount;
      }
    }
  } catch (e) {
    console.warn('Registrations fallback failed:', e);
  }

  return { labels, amounts: Object.keys(map).map(k => map[k]) };
}

function renderIncomeChart(labels, amounts) {
  try {
    const ctx = document.getElementById('incomeChart');
    if (!ctx) return;

    // destroy previous instance if exists
    const existing = window._incomeChartInstance;
    if (existing) {
      try { existing.destroy(); } catch {}
      window._incomeChartInstance = null;
    }

    const config = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'الدخل (دج)',
          data: amounts,
          backgroundColor: 'rgba(76,29,145,0.8)',
          borderColor: 'rgba(76,29,145,1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ctx.formattedValue + ' دج' } }
        }
      }
    };

    // create chart
    window._incomeChartInstance = new Chart(document.getElementById('incomeChart').getContext('2d'), config);
  } catch (e) {
    console.error('Failed to render chart:', e);
  }
}

// ✅ تجميع بيانات اللوحة
async function fetchDashboardData() {
  const teacherContact = localStorage.getItem('userContact');
  if (!teacherContact) {
    console.error('No teacher contact found in localStorage');
    return;
  }

  const teacherModules = await fetchTeacherModules();
  if (!teacherModules) return;

  const { counts: studentCounts, total: totalEarningsRaw } =
    await calculateTeacherEarnings(teacherModules, teacherContact);

  const list = document.getElementById('subjectsList');
  list.innerHTML = '';

const isAbdellah = teacherContact === '0555491316';
const isFirstYearBundleTeacher =
  teacherContact === '0555491316' || teacherContact === '0552329993';

const allSubjects = [
  // باقة السنة الأولى تظهر للأستاذين
  ...(isFirstYearBundleTeacher ? ['bundle_first_year'] : []),

  // باقة السنة الثانية والثالثة تظهر لعبد الله فقط
  ...(isAbdellah ? ['bundle_second_year', 'bundle_third_year'] : []),

  // باقي المواد
  ...Object.keys(studentCounts).filter(s =>
    !['bundle_first_year', 'bundle_second_year', 'bundle_third_year'].includes(s)
  )
];


  const sortedSubjects = allSubjects
    .filter(s => subjectPrices[s])
    .sort((a, b) => {
      if (a.startsWith('bundle') && !b.startsWith('bundle')) return -1;
      if (!a.startsWith('bundle') && b.startsWith('bundle')) return 1;
      return (studentCounts[b] || 0) - (studentCounts[a] || 0);
    });

  sortedSubjects.forEach(subj => {
    const students = studentCounts[subj] || 0;
    if (students <= 0) return;

const unitPrice = getTeacherUnitPrice(subj, teacherContact);
    const teacherEarning = isAbdellah ? (unitPrice * students) : ((unitPrice) * students);

    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
  li.innerHTML = `
  <span dir="rtl" style="direction: rtl; text-align: right;">
    ${formatSubjectName(subj)} (السعر الفردي: ${unitPrice} دج)
  </span>
  <span dir="rtl" style="direction: rtl; text-align: right;">
    ${students} مشترك | <span style="color:#16a34a;font-weight:700">${teacherEarning.toLocaleString()} دج</span>
  </span>
`;

    list.appendChild(li);
  });

// حساب عدد الطلاب الحقيقيين بدون تكرار
const students = await fetchAllApprovedStudents();
const uniqueStudents = new Set();

for (const student of students || []) {

  // تجاهل 039333...
  if (student.contact && student.contact.startsWith('039333')) continue;

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

  // هل الطالب سجل في أي مادة يدرّسها الأستاذ؟
  if (modules.some(m => teacherModules.includes(m))) {
    uniqueStudents.add(student.contact);
  }
}

document.getElementById('studentCount').textContent = uniqueStudents.size;

const totalEarnings = totalEarningsRaw;


  document.getElementById('totalEarnings').textContent = totalEarnings.toLocaleString();
  document.getElementById('totalEarnings').style.color = '#16a34a';

  // expose current teacher info for the selector handler
  window._currentTeacherContact = teacherContact;
  window._currentTeacherModules = teacherModules;

  // Render chart based on current selector (default is 30)
  try {
    const select = document.getElementById('incomeRangeSelect');
    const option = select ? select.value : '30';
    const { labels, amounts } = await fetchIncomeForRange(option, teacherContact, teacherModules);
    renderIncomeChart(labels, amounts);
  } catch (e) {
    console.warn('Could not render income chart:', e);
  }

  // listen for range changes
  const rangeSelect = document.getElementById('incomeRangeSelect');
  if (rangeSelect && !rangeSelect._listenerAttached) {
    rangeSelect.addEventListener('change', async (evt) => {
      try {
        const val = evt.target.value;
        const tc = window._currentTeacherContact;
        const tm = window._currentTeacherModules || [];
        const { labels, amounts } = await fetchIncomeForRange(val, tc, tm);
        renderIncomeChart(labels, amounts);
      } catch (err) {
        console.error('Range change failed:', err);
      }
    });
    rangeSelect._listenerAttached = true;
  }


// ✅ عرض قائمة الطلاب المسجلين في الأسفل
const studentsContainer = document.createElement('div');
studentsContainer.classList.add('students-table');
studentsContainer.innerHTML = `
  <h3 dir="rtl" style="direction: rtl; text-align: right; color:#4c1d95; border-bottom:2px solid #6b21a8; padding-bottom:6px; margin-top:2rem;">
    👨‍🎓 قائمة الطلاب المسجّلين
  </h3>
  <table dir="rtl" style="width:100%; border-collapse: collapse; margin-top:1rem;">
    <thead>
      <tr style="background:#eef2ff; color:#4c1d95; text-align:right;">
      <th style="padding:10px; border-bottom:1px solid #ddd;">#</th>
      <th style="padding:10px; border-bottom:1px solid #ddd;">الاسم الكامل</th>
        <th style="padding:10px; border-bottom:1px solid #ddd;">رقم الهاتف</th>
        <th style="padding:10px; border-bottom:1px solid #ddd;">المواد</th>
      </tr>
    </thead>
    <tbody id="studentsRows"></tbody>
  </table>
`;
document.querySelector('main.dashboard').appendChild(studentsContainer);

// ✅ جلب بيانات الطلاب كاملة
const { data: allStudents, error: studentsError } = await supabase
  .from('registrations')
  .select('full_name, contact, modules, serial_id')
  .eq('is_approved', true)
  .is('is_teacher', null)
  .is('is_admin', null)
  .order('serial_id', { ascending: true });



if (!studentsError && allStudents.length > 0) {
  const tbody = document.getElementById('studentsRows');
  tbody.innerHTML = '';
let counter = 1;

allStudents.forEach(student => {
  if (student.contact && student.contact.startsWith('039333')) return;

  // ❌ إذا لم يكن الطالب مسجلاً في أي مادة من مواد الأستاذ → تجاهله
  let modulesList = [];
  if (Array.isArray(student.modules)) {
    modulesList = student.modules;
  } else if (typeof student.modules === 'string') {
    try {
      modulesList = JSON.parse(student.modules);
    } catch {
      modulesList = student.modules.split(',');
    }
  }

  const hasTeacherModule = modulesList.some(m => teacherModules.includes(m));

  if (!hasTeacherModule) return; // ⛔ تجاهل الطالب


if (Array.isArray(student.modules)) {
  modulesList = student.modules;
} else if (typeof student.modules === 'string') {
  try {
    modulesList = JSON.parse(student.modules);
  } catch {
    modulesList = student.modules.split(',');
  }
}

// ✅ تنسيق أسماء المواد
const modulesText = modulesList
  .map(m => {
    if (!m) return '';
    // إزالة الفراغات وتحويل كل كلمة إلى أول حرف كبير
    return m
      .trim()
      .replace(/_/g, ' ') // إزالة الشرطات السفلية
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  })
  .join(', ');


const row = document.createElement('tr');
row.innerHTML = `
  <td style="padding:10px; border-bottom:1px solid #eee;">${counter++}</td>
  <td style="padding:10px; border-bottom:1px solid #eee;">${student.full_name || '-'}</td>
  <td style="padding:10px; border-bottom:1px solid #eee;">${student.contact || '-'}</td>
  <td dir="ltr" style="direction:ltr; text-align:left; padding:10px; border-bottom:1px solid #eee; color:#374151;">
    ${modulesText || '-'}
  </td>
`;
tbody.appendChild(row);

  });
}


}

// ✅ تشغيل بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', fetchDashboardData);
// ✅ تحسين عرض الجدول في الهاتف (عرض كبطاقات نظيفة)
const responsiveStyle = document.createElement('style');
responsiveStyle.textContent = `
  @media (max-width: 768px) {
    .students-table {
      width: 100%;
      overflow-x: hidden;
      padding: 0 8px;
    }

    .students-table table {
      width: 100%;
      border-collapse: collapse;
    }

    /* إخفاء رأس الجدول */
    .students-table thead {
      display: none;
    }

    /* تحويل كل صف إلى بطاقة */
    .students-table tr {
      display: block;
      background: #fff;
      margin-bottom: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      padding: 10px 14px;
    }

    .students-table td {
      display: block;
      border: none !important;
      padding: 6px 0 !important;
      font-size: 0.95rem;
      color: #1f2937;
      word-break: break-word;
    }

    /* العناوين الصغيرة داخل البطاقة */
    .students-table td::before {
      display: block;
      font-weight: 700;
      color: #4c1d95;
      margin-bottom: 4px;
    }

    .students-table td:nth-child(1)::before { content: "👤 الاسم الكامل"; }
    .students-table td:nth-child(2)::before { content: "📞 رقم الهاتف"; }
    .students-table td:nth-child(3)::before { content: "📚 Modules"; }

    /* المواد تبقى من اليسار إلى اليمين */
    .students-table td[dir="ltr"] {
      direction: ltr;
      text-align: left;
      background: #fafafa;
      padding: 8px;
      border-radius: 8px;
    }
  }
`;
document.head.appendChild(responsiveStyle);
// (removed accidental append of undefined `style` variable)
