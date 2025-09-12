import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://sgcypxmnlyiwljuqvcup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM'
);

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

const subjectPrices = {
  'ondes_et_vibrations': 1500,
  'electrotechnique_fondamentale1': 1500,
  'electronique_fondamentale1': 1500,
  'informatique01': 800,
  'informatique02': 800,
  'informatique03': 800,
  'electronique_de_puissance': 1200,
  'probabilite_et_statistique': 800,
  'logique': 1000,
  'methode': 1000,
  'systeme_asservis': 800,
  'reseaux_electrique': 1000,
  'theorie_du_signal': 800,



  // ✅ المواد الإضافية
  'etat_de_l_art': 2500,
  'machines_electriques': 2500,
  'commandes_machines_electriques': 2500,
  'mesures_electriques_et_electroniques': 2500,

  // ✅ مواد الأستاذ Sami Braci
'math1': 2000,
'physique1': 2000,
'chimie1': 2000
};

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

  const { data: studentsFalse, error: errorFalse } = await supabase
    .from('registrations')
    .select('contact, modules')
    .eq('is_approved', true)
    .eq('is_teacher', false)
    .neq('contact', teacherContact);

  if (errorFalse) {
    console.error('Error fetching students with is_teacher=false:', errorFalse);
    return counts;
  }

  const { data: studentsNull, error: errorNull } = await supabase
    .from('registrations')
    .select('contact, modules')
    .is('is_teacher', null)
    .eq('is_approved', true)
    .neq('contact', teacherContact);

  if (errorNull) {
    console.error('Error fetching students with is_teacher=null:', errorNull);
    return counts;
  }

  const students = [...(studentsFalse || []), ...(studentsNull || [])];

  for (const student of students) {
    let modules = [];
    if (student.modules) {
      if (typeof student.modules === 'string') {
        try {
          modules = JSON.parse(student.modules);
        } catch {
          modules = [];
        }
      } else if (Array.isArray(student.modules)) {
        modules = student.modules;
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

  sortedSubjects.forEach(subj => {
    const students = studentCounts[subj] || 0;
    const unitPrice = subjectPrices[subj] || 2500;
    const totalPrice = students * unitPrice;
    const teacherEarning = (unitPrice / 2) * students;

    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';

    const subjectName = document.createElement('span');
    subjectName.textContent = `${formatSubjectName(subj)} (Unit Price: ${unitPrice} DA)`;

    const stats = document.createElement('span');
    stats.innerHTML = `
      <span>${students} student(s)</span>
      &nbsp;|&nbsp;
      <span style="color: #16a34a; font-weight: 700;">${teacherEarning.toLocaleString()} DA</span>
    `;

    li.appendChild(subjectName);
    li.appendChild(stats);
    list.appendChild(li);
  });

  const totalStudents = Object.values(studentCounts).reduce((sum, val) => sum + val, 0);
  document.getElementById('studentCount').textContent = totalStudents;

  const totalEarningsRaw = Object.values(studentCounts).reduce((sum, val, i) => {
    const subj = teacherModules[i];
    const price = subjectPrices[subj] || 2500;
    return sum + val * price;
  }, 0);
  const teacherShare = totalEarningsRaw / 2;

  document.getElementById('totalEarnings').textContent = teacherShare.toLocaleString();
document.getElementById('totalEarnings').style.color = '#16a34a';
}

document.addEventListener('DOMContentLoaded', () => {
  fetchDashboardData();
});
