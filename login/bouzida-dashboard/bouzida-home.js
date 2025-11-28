// حماية الصفحة
if (localStorage.getItem("userRole") !== "bouzida") {
  window.location.href = "../../login/login.html";
}

// تسجيل خروج
function logout() {
  localStorage.clear();
  window.location.href = "../../login/login.html";
}

// تحميل فيديو
function loadVideo(containerId, ytId) {
  document.getElementById(containerId).innerHTML = `
    <iframe
      style="width:100%; height:240px; border-radius:12px;"
      src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1"
      frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>`;
}
function playThisVideo(card, videoId) {
  card.innerHTML = `
    <iframe
      style="width:100%; height:220px; border-radius:12px;"
      src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1"
      frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>
  `;
}
