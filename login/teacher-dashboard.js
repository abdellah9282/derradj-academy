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

    // ✅ المواد الإضافية
    'etat_de_l_art': 'État de l’art',
    'machines_electriques': 'Machines Électriques',
    'commandes_machines_electriques': 'Commandes des Machines Électriques',
    'mesures_electriques_et_electroniques': 'Mesures Électriques et Électroniques'
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
  'informatique02': 1000, // Pascal
  'informatique03': 1000, // MATLAB
  'electronique_de_puissance': 1500, // avancée
  'probabilite_et_statistique': 1000,
  'logique': 1000, // Logique Combinatoire et Séquentielle
  'methode': 1200, // Méthodes Numériques L2+M1
  'systeme_asservis': 1200,
  'reseaux_electrique': 1200,
  'theorie_du_signal': 800,

  // ✅ مواد إضافية (احتفظت بها إن كنت تستعملها في النظام)
  'etat_de_l_art': 2500,
  'machines_electriques': 2500,
  'commandes_machines_electriques': 2500,
  'mesures_electriques_et_electroniques': 2500,
  'math_3': 2000,

  // ✅ مواد الأستاذ Sami Braci
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

async function countApprovedStudentsForSubjects(subjects, teacherContact) {
  if (!subjects || subjects.length === 0) return {};

  const counts = {};
  subjects.forEach(subj => counts[subj] = 0);

  // ✅ جلب الطلاب الموافق عليهم فقط، و is_teacher = null
  const { data: students, error } = await supabase
    .from('registrations')
    .select('contact, modules')
    .eq('is_approved', true)
    .is('is_teacher', null)
    .neq('contact', teacherContact);

  if (error) {
    console.error('Error fetching students:', error);
    return counts;
  }

  // ✅ حساب الطلاب في كل مادة
  for (const student of students || []) {
    // ⛔️ تجاهل أي طالب يبدأ رقمه بـ 039333
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

    for (const subj of subjects) {
      if (modules.includes(subj)) {
        counts[subj]++;
      }
    }
  }

  return counts;
}



// ✅ تجميع بيانات اللوحة (مع شرط الأستاذ عبد الله)
async function fetchDashboardData() {
  const teacherContact = localStorage.getItem('userContact');
  if (!teacherContact) {
    console.error('No teacher contact found in localStorage');
    return;
  }

  const teacherModules = await fetchTeacherModules();
  if (!teacherModules) return;

  const studentCounts = await countApprovedStudentsForSubjects(teacherModules, teacherContact);

  const sortedSubjects = [...teacherModules].sort((a, b) => (studentCounts[b] || 0) - (studentCounts[a] || 0));

  const list = document.getElementById('subjectsList');
  list.innerHTML = '';

  // ✅ تحديد ما إذا كان الأستاذ هو عبد الله
  const isAbdellah = teacherContact === '0555491316';

  sortedSubjects.forEach(subj => {
    const students = studentCounts[subj] || 0;
    const unitPrice = subjectPrices[subj] || 2500;

    // ✅ إذا كان الأستاذ عبد الله → يأخذ السعر الكامل
    // ✅ غيره → يأخذ نصف السعر
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

  // ✅ مجموع الطلاب
  const totalStudents = Object.values(studentCounts).reduce((sum, val) => sum + val, 0);
  document.getElementById('studentCount').textContent = totalStudents;

  // ✅ حساب الأرباح الكلية
  let totalEarningsRaw = 0;
  teacherModules.forEach(subj => {
    const count = studentCounts[subj] || 0;
    const price = subjectPrices[subj] || 2500;
    totalEarningsRaw += isAbdellah ? (count * price) : (count * price / 2);
  });

  const totalEarnings = totalEarningsRaw;
  document.getElementById('totalEarnings').textContent = totalEarnings.toLocaleString();
  document.getElementById('totalEarnings').style.color = '#16a34a';
}


// ✅ تشغيل بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', fetchDashboardData);
