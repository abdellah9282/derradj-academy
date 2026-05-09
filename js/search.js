const courses = [
  {
    title: "Algèbre 2",
    link: "/courses/algebre2.html",
    keywords: "الجبر 2 جبر algebra algebre تطبيقات خطية مصفوفات فضاءات متجهية محددات نواة صورة linear maps matrices vector spaces determinants kernel image applications linéaires espaces vectoriels déterminants نظرية الرتبة"
  },
  {
    title: "Ondes Et Vibrations",
    link: "/courses/ondes_et_vibrations.html",
    keywords: "موجات اهتزازات ذبذبات فيزياء ondes vibrations waves oscillations physics physique mécanique vibratoire"
  },
  {
    title: "Electronique Fondamentale 1",
    link: "/courses/electronique_fondamentale1.html",
    keywords: "إلكترونيك أساسي إلكترونيك دوائر إلكترونية ديود ترانزستور electronique electronics electronic circuits diodes transistors circuits électroniques"
  },
  {
    title: "Electrotechnique Fondamentale 1",
    link: "/courses/electrotechnique_fondamentale1.html",
    keywords: "كهروتقنية دوائر كهربائية تيار متردد هندسة كهربائية electrotechnique electrical engineering electric circuits courant alternatif"
  },
  {
    title: "Electronique De Puissance",
    link: "/courses/electronique_de_puissance.html",
    keywords: "إلكترونيك قدرة قدرة كهربائية محولات طاقة power electronics converters rectifiers inverters hacheurs redresseurs onduleurs thyristors électronique de puissance"
  },
  {
    title: "Informatique 1",
    link: "/courses/informatique01.html",
    keywords: "إعلام آلي 1 برمجة حاسوب كمبيوتر خوارزميات informatique computer science programming algorithm pascal numération binaire algorithmique"
  },
  {
    title: "Informatique 2",
    link: "/courses/informatique02.html",
    keywords: "إعلام آلي 2 هياكل بيانات برمجة حاسوب informatique computer science data structures programming structures de données C"
  },
  {
    title: "Informatique 3",
    link: "/courses/informatique03.html",
    keywords: "إعلام آلي 3 قواعد بيانات شبكات حاسوب informatique computer science databases networks bases de données réseaux"
  },
  {
    title: "Logique Combinatoire et Séquentielle",
    link: "/courses/logique.html",
    keywords: "منطق دوائر رقمية منطق توافقي منطق تتابعي جبر بولي logique digital logic combinational sequential circuits boolean algebra algèbre de Boole circuits logiques numérique"
  },
  {
    title: "Methodes Numériques (L2 + M1)",
    link: "/courses/methode.html",
    keywords: "طرق عددية تحليل عددي تقريب رياضيات méthodes numériques numerical methods numerical analysis interpolation analyse numérique"
  },
  {
    title: "Probabilité Et Statistique",
    link: "/courses/probabilite_et_statistique.html",
    keywords: "احتمالات إحصاء توزيع احتمالي متغيرات عشوائية probabilite statistique probability statistics distributions normal law loi normale variables aléatoires"
  },
  {
    title: "Reseaux Électrique",
    link: "/courses/réseaux_electrique.html",
    keywords: "شبكات كهربائية دوائر كهربائية كيرشوف تيار جهد reseaux électrique electrical networks circuits Kirchhoff lois de Kirchhoff"
  },
  {
    title: "Systemes Asservis",
    link: "/courses/systeme_asservis.html",
    keywords: "أنظمة تحكم أنظمة آلية ضبط آلي لابلاس تحكم systeme asservi control systems automatic control feedback Laplace automatique régulation Bode Nyquist transformée de Laplace"
  },
  {
    title: "Theorie du signal",
    link: "/courses/theorie_du_signal.html",
    keywords: "نظرية الإشارة إشارات تحويل فورييه معالجة إشارات signal theory signals Fourier transform signal processing théorie du signal transformée de Fourier traitement du signal Dirac"
  },
  {
    title: "Théorie du Champ Électromagnétique",
    link: "/courses/theorie_du_champ.html",
    keywords: "حقل كهرومغناطيسي مغناطيسية كهرومغناطيس كولوم theorie du champ electromagnetic field electromagnetism Maxwell Coulomb champ électromagnétique électrostatique"
  },
  {
    title: "Machine Électrique",
    link: "/courses/machine_electrique.html",
    keywords: "آلات كهربائية محركات كهربائية محولات مولدات machine électrique machines électriques moteurs transformateurs génératrices electric machines motors generators"
  },
  {
    title: "Les Quadripôles",
    link: "/courses/les_quadripoles.html",
    keywords: "رباعيات معاملات شبكات ثنائية القطب quadripoles two-port networks four-terminal parameters paramètres Z Y ABCD circuits électroniques"
  },
  {
    title: "État de l'Art",
    link: "/courses/etat_de_lart.html",
    keywords: "حالة المعرفة منهجية بحث علمي مراجعة أدبية etat de l'art state of the art methodology literature review méthodologie recherche bibliographique"
  },
  {
    title: "Math 3 – Analyse 3",
    link: "/courses/math3_analyse3.html",
    keywords: "رياضيات 3 تحليل 3 تكاملات معادلات تفاضلية دوال متعددة المتغيرات math3 analyse3 math 3 analysis 3 integrals differential equations multivariable functions intégrales équations différentielles fonctions de plusieurs variables intégrales doubles"
  },
];

const input = document.getElementById("searchInput");
const suggestionsList = document.getElementById("suggestionsList");

if (!input || !suggestionsList) return;

input.addEventListener("input", () => {
  const query = input.value.toLowerCase().trim();
  suggestionsList.innerHTML = "";

  if (!query) {
    suggestionsList.classList.remove("active");
    return;
  }

  const filtered = courses.filter(course =>
    course.title.toLowerCase().includes(query) ||
    course.keywords.toLowerCase().includes(query)
  );

  if (filtered.length > 0) {
    suggestionsList.classList.add("active");
    filtered.forEach(course => {
      const li = document.createElement("li");
      li.className = "suggestion-item";
      li.textContent = course.title;
      li.onclick = () => {
        window.location.href = course.link;
      };
      suggestionsList.appendChild(li);
    });
  } else {
    suggestionsList.classList.remove("active");
  }
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-box")) {
    suggestionsList.classList.remove("active");
  }
});
