// ================================
// course.js (FINAL VERSION)
// ================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// 🔵 Supabase Config
const supabase = createClient(
  'https://sgcypxmnlyiwljuqvcup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM'
);

// ================================
// DOM ELEMENTS
// ================================
const usernameEl   = document.getElementById("username");
const ratingPopup  = document.getElementById("rating-popup");
const closePopup   = document.getElementById("close-popup");
const goToRating   = document.getElementById("go-to-rating");
const ratingValue  = document.getElementById("rating-value-display");
const ratingMsg    = document.getElementById("ratingMessage");
const submitBtn    = document.getElementById("submitRating");
const commentInput = document.getElementById("userComment");
const avgRatingEl  = document.getElementById("average-rating");

// ⭐ النجوم
const stars = document.querySelectorAll(".star");
let selectedRating = 0;

// ================================
// MODULE NAME (AUTO)
// ================================
const moduleName = document.body.dataset.module;

// ================================
// INIT
// ================================
(async function initCourse() {
  const contact = localStorage.getItem("userContact");

  if (!contact || !moduleName) {
    forceLogout();
    return;
  }

  // 1️⃣ جلب بيانات الطالب
  const { data: user, error } = await supabase
    .from("registrations")
    .select("full_name, modules")
    .eq("contact", contact)
    .single();

  if (error || !user) {
    forceLogout();
    return;
  }

  // 2️⃣ عرض الاسم
  if (usernameEl) {
    usernameEl.textContent = user.full_name;
  }

  // 3️⃣ التحقق من صلاحية المادة
  if (!user.modules || !user.modules.includes(moduleName)) {
    forceLogout();
    return;
  }

  // 4️⃣ هل قيّم من قبل؟
  const hasRated = await checkIfRated(contact, moduleName);

  if (!hasRated) {
    // ⏰ popup بعد 10 ثواني
    setTimeout(() => {
      if (ratingPopup) ratingPopup.style.display = "flex";
    }, 10000);
  }

  // 5️⃣ عرض متوسط التقييم
  loadAverageRating();
})();

// ================================
// CHECK IF ALREADY RATED
// ================================
async function checkIfRated(contact, module) {
  const { data } = await supabase
    .from("course_ratings")
    .select("id")
    .eq("contact", contact)
    .eq("module", module)
    .maybeSingle();

  return !!data;
}

// ================================
// AVERAGE RATING
// ================================
async function loadAverageRating() {
  const { data } = await supabase
    .from("course_ratings")
    .select("rating")
    .eq("module", moduleName);

  if (!data || data.length === 0) return;

  const avg =
    data.reduce((sum, r) => sum + r.rating, 0) / data.length;

  if (avgRatingEl) {
    avgRatingEl.textContent = `⭐ ${avg.toFixed(1)} / 5`;
  }
}

// ================================
// STAR RATING UI
// ================================
stars.forEach(star => {
  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.value);
    ratingValue.textContent = `${selectedRating}/5`;

    stars.forEach(s =>
      s.classList.toggle(
        "active",
        Number(s.dataset.value) <= selectedRating
      )
    );
  });
});

// ================================
// SUBMIT RATING
// ================================
if (submitBtn) {
  submitBtn.addEventListener("click", async () => {
    const contact = localStorage.getItem("userContact");
    const comment = commentInput.value.trim();

    if (!selectedRating) {
      ratingMsg.textContent = "⚠️ اختر عدد النجوم أولاً";
      return;
    }

    const { data: user } = await supabase
      .from("registrations")
      .select("full_name")
      .eq("contact", contact)
      .single();

    const { error } = await supabase
      .from("course_ratings")
      .insert([{
        contact: contact,
        module: moduleName,
        rating: selectedRating,
        comment: comment || null,
        full_name: user.full_name
      }]);

    if (error) {
      ratingMsg.textContent = "❌ حدث خطأ، حاول لاحقًا";
      return;
    }

    ratingMsg.textContent = "✅ شكرًا لك على التقييم!";
    submitBtn.disabled = true;

    loadAverageRating();
  });
}

// ================================
// POPUP CONTROLS
// ================================
if (closePopup) {
  closePopup.onclick = () => ratingPopup.style.display = "none";
}

if (goToRating) {
  goToRating.onclick = () => {
    ratingPopup.style.display = "none";
    document.getElementById("rating-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };
}

// ================================
// FORCE LOGOUT
// ================================
function forceLogout() {
  localStorage.clear();
  window.location.replace("../login/login.html");
}
