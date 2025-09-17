// استيراد Supabase
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://sgcypxmnlyiwljuqvcup.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM"
);

// التحقق من session_id و device_id في بداية الصفحة + الخروج الفوري إذا تغيرت الجلسة من متصفح آخر
(async () => {
  const sessionId = localStorage.getItem("sessionId");
  const deviceId = localStorage.getItem("deviceId");
  const contact = localStorage.getItem("userContact");

  if (!sessionId || !deviceId || !contact) {
    localStorage.clear();
    window.location.href = "/login/login.html";
    return;
  }

  const { data, error } = await supabase
    .from("registrations")
    .select("session_id, device_id")
    .eq("contact", contact)
    .single();

  if (error || !data) {
    console.error("❌ فشل في جلب session/device:", error);
    localStorage.clear();
    window.location.href = "/login/login.html";
    return;
  }

if (data.session_id !== sessionId || data.device_id !== deviceId) {
  console.warn("🚫 تم تسجيل الدخول من جهاز آخر أو تم إنهاء الجلسة. سيتم تسجيل خروجك الآن.");
  setTimeout(() => {
    localStorage.clear();
    window.location.href = "/login/login.html";
  }, 5000); // 2000 مللي ثانية = 2 ثوانٍ
} else {
  console.log("✅ الجلسة والجهاز مطابقين.");
  localStorage.setItem("userToken", "ok");
}

})();

// كائن الدورات (جميع مواد الأستاذ Abdellah Derradj)
const allCourses = {
  ondes_et_vibrations: {
    title: "Ondes et Vibrations",
    instructor: "Abdellah Derradj",
    price: 1200,
    rating: 4.5,
    reviews: 48000,
    image: "../Thumbnail/ondes_et_vibrations/01.jpg"
  },
  electrotechnique_fondamentale1: {
    title: "Électrotechnique Fondamentale 1",
    instructor: "Abdellah Derradj",
    price: 1500,
    rating: 4.6,
    reviews: 56000,
    image: "../Thumbnail/elt_f_1/04.jpg"
  },
  electronique_fondamentale1: {
    title: "Électronique Fondamentale 1",
    instructor: "Abdellah Derradj",
    price: 1500,
    rating: 4.7,
    reviews: 32000,
    image: "../Thumbnail/electroniquef1/01.jpg"
  },
  informatique01: {
    title: "Informatique 1",
    instructor: "Abdellah Derradj",
    price: 800,
    rating: 4.4,
    reviews: 15000,
    image: "../Thumbnail/informatique1/01.jpg"
  },
  informatique02: {
    title: "Informatique 2 (Pascal)",
    instructor: "Abdellah Derradj",
    price: 800,
    rating: 4.5,
    reviews: 14000,
    image: "../Thumbnail/Informatique2/02.jpg"
  },
  informatique03: {
    title: "Informatique 3 (MATLAB)",
    instructor: "Abdellah Derradj",
    price: 800,
    rating: 4.5,
    reviews: 14200,
    image: "../Thumbnail/Informatique3/01.webp"
  },
  electronique_de_puissance: {
    title: "Électronique de Puissance (avancée)",
    instructor: "Abdellah Derradj",
    price: 1200,
    rating: 4.8,
    reviews: 22000,
    image: "../Thumbnail/electronique_de_puissance/03.webp"
  },
  probabilite_et_statistique: {
    title: "Probabilité et Statistique",
    instructor: "Abdellah Derradj",
    price: 800,
    rating: 4.4,
    reviews: 18500,
    image: "../Thumbnail/statistique/01.jpg"
  },
  logique: {
    title: "Logique Combinatoire et Séquentielle",
    instructor: "Abdellah Derradj",
    price: 1000,
    rating: 4.3,
    reviews: 12000,
    image: "../Thumbnail/Logique Combinatoire et Séquentielle/08.jpg"
  },
  methode: {
    title: "Méthodes Numériques L2+M1",
    instructor: "Abdellah Derradj",
    price: 1000,
    rating: 4.5,
    reviews: 13000,
    image: "../Thumbnail/methode_numerique/01.jpg"
  },
  systeme_asservis: {
    title: "Systèmes Asservis",
    instructor: "Abdellah Derradj",
    price: 800,
    rating: 4.4,
    reviews: 11000,
    image: "../Thumbnail/systemeasservi/02.jpg"
  },
  reseaux_electrique: {
    title: "Réseaux Électriques",
    instructor: "Abdellah Derradj",
    price: 1000,
    rating: 4.5,
    reviews: 12500,
    image: "../Thumbnail/reseau_electrique/01.jpg"
  },
  theorie_du_signal: {
    title: "Théorie du Signal",
    instructor: "Abdellah Derradj",
    price: 800,
    rating: 4.6,
    reviews: 11800,
    image: "../Thumbnail/theorie_de_signal/02.jpg"
  }
};

// روابط الصفحات الخاصة بكل مادة
const courseLinks = {
  ondes_et_vibrations: "../courses-cards/ondes_et_vibrations.html",
  electrotechnique_fondamentale1: "../courses-cards/electrotechnique_fondamentale1.html",
  electronique_fondamentale1: "../courses-cards/electronique_fondamentale1.html",
  informatique01: "../courses-cards/informatique01.html",
  informatique02: "../courses-cards/informatique02.html",
  informatique03: "../courses-cards/informatique03.html",
  electronique_de_puissance: "../courses-cards/electronique_de_puissance.html",
  probabilite_et_statistique: "../courses-cards/probabilite_et_statistique.html",
  logique: "../courses-cards/logique.html",
  methode: "../courses-cards/methode.html",
  systeme_asservis: "../courses-cards/systeme_asservis.html",
  reseaux_electrique: "../courses-cards/reseaux_electrique.html",
  theorie_du_signal: "../courses-cards/theorie_du_signal.html"
};



document.addEventListener("DOMContentLoaded", () => {
  const userName = localStorage.getItem("userName");
  const userModulesRaw = localStorage.getItem("userModules");
  const contact = localStorage.getItem("userContact"); // جلب رقم المستخدم الحقيقي من التخزين المحلي

  if (!userName || !userModulesRaw || !contact) {
    window.location.href = "/login/login.html";
    return;
  }

  const userModules = JSON.parse(userModulesRaw);
  const container = document.getElementById("courses-container");

  if (!Array.isArray(userModules) || userModules.length === 0) {
    container.innerHTML = "<p style='text-align: center; color:red;'>❌ No registered courses found.</p>";
  } else {
    // عرض الدورات المسجلة
    const fragment = document.createDocumentFragment();
userModules.forEach((moduleKey) => {
  const course = allCourses[moduleKey];
  const card = document.createElement("div");
  card.className = "course-card";
  card.innerHTML = `
    <img src="${course.image}" alt="${course.title}" class="course-img" />
    <div class="course-content">
      <h3 class="course-title">${course.title}</h3>
      <p class="instructor">${course.instructor}</p>
      <div class="rating">
        <span class="rating-value" id="rating-${moduleKey}">...</span>
        <span class="stars">★ ★ ★ ★ ★</span>
        <span class="reviews" id="reviews-${moduleKey}">(...)</span>
      </div>
      <a href="${courseLinks[moduleKey] || '#'}" class="course-btn">Go to Course</a>
    </div>
  `;
  fragment.appendChild(card);

  // ✅ بعدها: استدعِ تقييمات الدورة
  fetchRatings(moduleKey).then(({ average, count }) => {
    const ratingEl = document.getElementById(`rating-${moduleKey}`);
    const reviewsEl = document.getElementById(`reviews-${moduleKey}`);
    if (ratingEl) ratingEl.textContent = average;
    if (reviewsEl) reviewsEl.textContent = `(${count.toLocaleString()})`;
  });
});
container.appendChild(fragment);
  }

  // ✅ تعبئة قائمة الدورات المتبقية
  const courseSelect = document.getElementById("courseSelect");
  if (courseSelect) {
    courseSelect.innerHTML = '<option value="">Select a New Course</option>';
    Object.entries(allCourses).forEach(([key, course]) => {
      if (!userModules.includes(key)) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = course.title;
        courseSelect.appendChild(option);
      }
    });
  }

  // تسجيل الخروج
  window.logout = function () {
    localStorage.clear();
    window.location.href = "/login/login.html";
  };

  // تحديث اسم المستخدم
const userNameEl = document.getElementById("userNameBox");
if (userNameEl) {
  userNameEl.textContent = localStorage.getItem("userName");
}

// تحديث جهة الاتصال
const userContactEl = document.getElementById("userContactBox");
if (userContactEl) {
  userContactEl.textContent = localStorage.getItem("userContact");
}

// تحديث رسالة الشراء
const messageDiv = document.getElementById("purchase-message");
if (messageDiv) {
  messageDiv.textContent = "";
}

  const purchaseForm = document.getElementById("purchase-form");

async function checkPendingRequest() {
  const contact = localStorage.getItem("userContact");
  if (!contact || !purchaseForm) return;

  const submitBtn = purchaseForm.querySelector('button[type="submit"]');
  const messageDiv = document.getElementById("purchase-message");
  console.log("messageDiv:", messageDiv);
if (messageDiv) {
    messageDiv.textContent = "";
}

  // التحقق من حالة الطلب المخزنة في localStorage
  const pendingRequest = localStorage.getItem("pendingRequest");
  if (pendingRequest === "true") {
    submitBtn.disabled = true;
    submitBtn.textContent = "✅.تم إرسال الطلب بنجاح، بانتظار الموافقة";
    submitBtn.style.backgroundColor = "#ccc";
    submitBtn.style.cursor = "not-allowed";
    messageDiv.textContent = "⚠️.لديك طلب جارٍ قيد المراجعة، لا يمكن إرسال طلب جديد حالياً";
    messageDiv.style.color = "orange";
    return;
  }

  // التحقق من الطلبات في قاعدة البيانات
  const { data: existingRequest } = await supabase
    .from("new_requests")
    .select("*")
    .eq("user_contact", contact)
    .is("is_approved", null)
    .maybeSingle();

  if (existingRequest) {
    // إذا كان هناك طلب جاري
    localStorage.setItem("pendingRequest", "true");
    submitBtn.disabled = true;
    submitBtn.textContent = "✅.تم إرسال الطلب بنجاح، بانتظار الموافقة";
    submitBtn.style.backgroundColor = "#ccc";
    submitBtn.style.cursor = "not-allowed";
    messageDiv.textContent = "⚠️.لديك طلب جارٍ قيد المراجعة، لا يمكن إرسال طلب جديد حالياً";
    messageDiv.style.color = "orange";
  } else {
    // إذا لم يكن هناك طلب جاري
    localStorage.setItem("pendingRequest", "false");
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Request";
    submitBtn.style.backgroundColor = "";
    submitBtn.style.cursor = "";
    messageDiv.textContent = "";
  }
}

// نادِ الدالة عند تحميل الصفحة
if (purchaseForm) {
  checkPendingRequest();
}

  if (purchaseForm) {
    purchaseForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = purchaseForm.querySelector('button[type="submit"]');
      const messageDiv = document.getElementById("purchase-message");

      // منع الإرسال إذا كان الزر معطل
      if (submitBtn.disabled) {
        messageDiv.textContent = "⚠️.لديك طلب جارٍ قيد المراجعة، لا يمكن إرسال طلب جديد حالياً";
        messageDiv.style.color = "orange";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending request...";

      try {
        const selectedModule = document.getElementById("courseSelect").value;
        const fileInput = document.getElementById("receipt");

        if (!selectedModule || !fileInput.files[0]) {
          messageDiv.textContent = "⚠️.تأكد من اختيار الدورة ورفع وصل الدفع";
          messageDiv.style.color = "red";
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Request";
          return;
        }

        // جلب بيانات المستخدم من جدول registrations
        const { data: userData, error: fetchError } = await supabase
          .from("registrations")
          .select("full_name")
          .eq("contact", contact)
          .single();

        if (fetchError || !userData) {
          messageDiv.textContent = "❌.لم يتم العثور على المستخدم";
          messageDiv.style.color = "red";
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Request";
          return;
        }

        // رفع ملف الوصل
        const file = fileInput.files[0];
        const fileName = `${contact}-${Date.now()}-${file.name}`;

        const { error: fileError } = await supabase.storage
          .from("receipts")
          .upload(fileName, file);

        if (fileError) {
          console.error("File upload error:", fileError);
          messageDiv.textContent = "❌ فشل في رفع الوصل. حاول مرة أخرى لاحقًا.";
          messageDiv.style.color = "red";
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Request";
          return;
        }

        const receiptUrl = `https://sgcypxmnlyiwljuqvcup.supabase.co/storage/v1/object/public/receipts/${fileName}`;

        // إدخال طلب المادة الجديدة
        const { error: insertError } = await supabase
          .from("new_requests")
          .insert([{
            user_contact: contact,
            full_name: userData.full_name,
            new_modules: [selectedModule],
            receipt_url: receiptUrl,
            is_approved: null
          }]);

        if (insertError) {
          console.error("Database insert error:", insertError);
          messageDiv.textContent = "❌.فشل في إرسال الطلب. حاول مرة أخرى لاحقًا.";
          messageDiv.style.color = "red";
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Request";
          return;
        }

        // نجاح الطلب
        localStorage.setItem("pendingRequest", "true"); // تخزين حالة الطلب
        messageDiv.textContent = "✅.تم إرسال الطلب بنجاح، بانتظار الموافقة";
        messageDiv.style.color = "green";
        purchaseForm.reset();
        submitBtn.disabled = true;
        submitBtn.textContent = "✅.تم إرسال طلب مسبق، بانتظار المراجعة";
        submitBtn.style.backgroundColor = "#ccc";
        submitBtn.style.cursor = "not-allowed";

      } catch (error) {
        console.error("Unexpected error:", error);
        messageDiv.textContent = "❌ حدث خطأ غير متوقع.";
        messageDiv.style.color = "red";
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Request";
      }
    });
}});
// التحقق من session_id في بداية الصفحة
(async () => {
  const sessionId = localStorage.getItem("sessionId");
  const contact = localStorage.getItem("userContact");

  if (!sessionId || !contact) {
    localStorage.clear();
    window.location.href = "/login/login.html";
    return;
  }

  const { data, error } = await supabase
    .from("registrations")
    .select("session_id")
    .eq("contact", contact)
    .single();

  if (error) {
    console.error("Error fetching session_id:", error);
    localStorage.clear();
    window.location.href = "/login/login.html";
    return;
  }

  if (!data || data.session_id !== sessionId) {
    console.warn("🚫 session_id غير متطابق. سيتم تحويلك إلى تسجيل الدخول.");
    localStorage.clear();
    window.location.href = "../../login/login.html";
  } else {
    console.log("✅ الجلسة صالحة.");
    localStorage.setItem("userToken", "ok");
  }
})();

async function handlePendingRequest(contact, submitBtn, messageDiv) {
  const pendingRequest = localStorage.getItem("pendingRequest");
  if (pendingRequest === "true") {
    submitBtn.disabled = true;
    submitBtn.textContent = "✅.تم إرسال الطلب بنجاح، بانتظار الموافقة";
    submitBtn.style.backgroundColor = "#ccc";
    submitBtn.style.cursor = "not-allowed";
    messageDiv.textContent = "⚠️.لديك طلب جارٍ قيد المراجعة، لا يمكن إرسال طلب جديد حالياً";
    messageDiv.style.color = "orange";
    return true;
  }

  const { data: existingRequest } = await supabase
    .from("new_requests")
    .select("*")
    .eq("user_contact", contact)
    .is("is_approved", null)
    .maybeSingle();

  if (existingRequest) {
    localStorage.setItem("pendingRequest", "true");
    return handlePendingRequest(contact, submitBtn, messageDiv);
  }

  localStorage.setItem("pendingRequest", "false");
  submitBtn.disabled = false;
  submitBtn.textContent = "Submit Request";
  submitBtn.style.backgroundColor = "";
  submitBtn.style.cursor = "";
  messageDiv.textContent = "";
  return false;
}

// 🟡 دالة جلب التقييمات والتعليقات من Supabase
async function fetchRatings(moduleKey) {
  const { data, error } = await supabase
    .from("course_ratings")
    .select("rating, comment")
    .eq("module", moduleKey);

  if (error) {
    console.error("❌ خطأ في جلب التقييمات:", error);
    return { average: "?", count: 0 };
  }

  const total = data.reduce((sum, item) => sum + item.rating, 0);
  const average = data.length > 0 ? (total / data.length).toFixed(1) : "?";
  const count = data.length;

  return { average, count };
}
document.addEventListener("DOMContentLoaded", () => {
  const fullName = localStorage.getItem("userName") || "المستخدم";
  const usernameEl = document.getElementById("username");
  if (usernameEl) {
    usernameEl.textContent = fullName;
  }
});

