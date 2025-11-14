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
  };
  return map[code] || code;
}

// ✅ الأسعار
const subjectPrices = {
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
  const fullPriceSubjects = ['math1', 'physique1', 'chimie1', 'math2', 'physique2'];

  // إذا كانت المادة من مواد 1300 دج
  if (fullPriceSubjects.includes(subject)) {

    if (teacherContact === '0552329993') {
      // هذا الأستاذ يأخذ 1300 كاملة
      return 1300;
    } else {
      // كل الأساتذة الآخرين يأخذون 700 دج فقط
      return 700;
    }
  }

  // باقي المواد تعود لنظامها العادي
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
    const hasThirdBundle = bundleThird.every(m => modules.includes(m));

   // حساب الباقات فقط للأستاذ عبد الله
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


    for (const subj of subjects) {
      if (modules.includes(subj)) {
        counts[subj] = (counts[subj] || 0) + 1;
totalEarnings += getTeacherUnitPrice(subj, teacherContact);
      }
    }
  }

  return { counts, total: totalEarnings };
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

const allSubjects = [
  ...(isAbdellah ? ['bundle_second_year', 'bundle_third_year'] : []),
  ...Object.keys(studentCounts).filter(s => !['bundle_second_year','bundle_third_year'].includes(s))
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


document.head.appendChild(style);
