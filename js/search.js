const courses = [
  { title: "Ondes Et Vibrations", link: "/courses/ondes_et_vibrations.html" },
  { title: "Electronique Fondamentale 1", link: "/courses/electronique_fondamentale1.html" },
  { title: "Electrotechnique Fondamentale 1", link: "/courses/electrotechnique_fondamentale1.html" },
  { title: "Electronique De Puissance", link: "/courses/electronique_de_puissance.html" },
  { title: "Informatique 1", link: "/courses/informatique01.html" },
  { title: "Informatique 2", link: "/courses/informatique02.html" },
  { title: "Informatique 3", link: "/courses/informatique03.html" },
  { title: "Logique Combinatoire et Séquentielle", link: "/courses/logique.html" },
  { title: "Methodes Numériques (L2 + M1)", link: "/courses/methode.html" },
  { title: "Probabilité Et Statistique", link: "/courses/probabilite_et_statistique.html" },
  { title: "Reseaux Électrique", link: "/courses/réseaux_electrique.html" },
  { title: "Systemes Asservis", link: "/courses/systeme_asservis.html" },
  { title: "Theorie du signal", link: "/courses/theorie_du_signal.html" },
];



const input = document.getElementById("searchInput");
const suggestionsList = document.getElementById("suggestionsList");

input.addEventListener("input", () => {
  const query = input.value.toLowerCase().trim();
  suggestionsList.innerHTML = "";

  if (!query) {
    suggestionsList.classList.remove("active");
    return;
  }

  const filtered = courses.filter(course =>
    course.title.toLowerCase().includes(query)
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
