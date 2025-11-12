import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ✅ إنشاء عميل Supabase
const supabase = createClient(
  'https://sgcypxmnlyiwljuqvcup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM'
);

// ✅ خريطة أسماء المواد
function formatSubjectName(code) {
  const map = {
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

  'etat_de_l_art': 2500,
  'machines_electriques': 2500,
  'commandes_machines_electriques': 2500,
  'mesures_electriques_et_electroniques': 2500,
  'math_3': 2000,

  'bundle_second_year': 5000,
  'bundle_third_year': 3500,

  'math1': 2000,
  'physique1': 2000,
  'chimie1': 2000
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

// ✅ دالة تجلب جميع الصفوف (تتجاوز حد 100)
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

// ✅ الدالة لحساب الأرباح لكل أستاذ
async function calculateTeacherEarnings(subjects, teacherContact) {
  if (!subjects || subjects.length === 0) return { counts: {}, total: 0 };

  const students = await fetchAllApprovedStudents();

  const counts = {};
  let totalEarnings = 0;

  for (const subj of subjects) counts[subj] = 0;

  for (const student of students || []) {
    if (!student.modules) continue;

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

    for (const subj of subjects) {
      if (modules.includes(subj)) {
        counts[subj] = (counts[subj] || 0) + 1;
        totalEarnings += subjectPrices[subj] || 0;
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
    'bundle_second_year',
    'bundle_third_year',
    ...Object.keys(studentCounts).filter(s => s !== 'bundle_second_year' && s !== 'bundle_third_year')
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

    const unitPrice = subjectPrices[subj] || 2500;
    const teacherEarning = isAbdellah ? (unitPrice * students) : ((unitPrice / 2) * students);

    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    li.innerHTML = `
      <span>${formatSubjectName(subj)} (Unit Price: ${unitPrice} DA)</span>
      <span>${students} student(s) | <span style="color:#16a34a;font-weight:700">${teacherEarning.toLocaleString()} DA</span></span>
    `;
    list.appendChild(li);
  });

  const totalStudents = Object.values(studentCounts).reduce((a, b) => a + b, 0);
  document.getElementById('studentCount').textContent = totalStudents;

  const isAbdellahFactor = isAbdellah ? 1 : 0.5;
  const totalEarnings = totalEarningsRaw * isAbdellahFactor;

  document.getElementById('totalEarnings').textContent = totalEarnings.toLocaleString();
  document.getElementById('totalEarnings').style.color = '#16a34a';
}

// ✅ تشغيل بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', fetchDashboardData);
