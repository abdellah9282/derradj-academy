const courses = [
  { title: "Ondes Et Vibrations", link: "/courses/ondes_et_vibrations.html" },
  { title: "Électronique Fondamentale 1", link: "/courses/electronique_fondamentale1.html" },
  { title: "Electrotechnique Fondamentale 1", link: "/courses/electrotechnique_fondamentale1.html" },
  { title: "Electricité Industrielle", link: "/courses/electricite_industrielle.html" }
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
