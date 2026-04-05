
const supabase = window.supabase.createClient(  "https://sgcypxmnlyiwljuqvcup.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM"
);
// ================================
// 🔐 SESSION GUARD (LAST LOGIN WINS)
// ================================

async function enforceLatestSession() {
  const contact   = localStorage.getItem("userContact");
  const sessionId = localStorage.getItem("sessionId");
  const deviceId  = localStorage.getItem("deviceId");

  // ❌ جلسة غير صالحة
  if (!contact || !sessionId || !deviceId) {
    localStorage.clear();
    window.location.replace("/login/login.html");
    return;
  }

  try {
    const { data, error } = await supabase
      .from("registrations")
      .select("session_id, device_id")
      .eq("contact", contact)
      .single();

    if (error || !data) {
      localStorage.clear();
      window.location.replace("/login/login.html");
      return;
    }

    // ❌ هناك تسجيل دخول أحدث
    if (
      data.session_id !== sessionId ||
      data.device_id  !== deviceId
    ) {
      localStorage.clear();
      window.location.replace("/login/session_conflict.html");
    }

  } catch (err) {
    console.error("❌ Session guard error:", err);
    localStorage.clear();
    window.location.replace("/login/login.html");
  }
}
// تشغيل فوري
enforceLatestSession();

// فحص دوري (يطرد الجلسة القديمة خلال ثواني)
setInterval(enforceLatestSession, 8000);

// UUID
function uuid() {
  return crypto.randomUUID();
}

// جهاز ثابت
function getOrCreateDeviceId() {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = uuid();
    localStorage.setItem("deviceId", id);
  }
  return id;
}

// جلسة جديدة دائمًا
function createNewSessionId() {
  const id = uuid();
  localStorage.setItem("sessionId", id);
  return id;
}

// ✅ هذا هو المهم
export async function loginAndClaimSession(contact, fullName) {
  const deviceId = getOrCreateDeviceId();
  const sessionId = createNewSessionId();

  localStorage.setItem("userContact", contact);
  localStorage.setItem("userName", fullName);

  // 🔥 آخر دخول يربح
  const { error } = await supabase
    .from("registrations")
    .update({
      session_id: sessionId,
      device_id: deviceId
    })
    .eq("contact", contact);

  if (error) {
    console.error(error);
    localStorage.clear();
    alert("❌ فشل تسجيل الدخول");
    return;
  }

  // ✅ نجاح
  window.location.href = "/login/dashboard.html";
}

const allCourses = {

algebre_2: {
  title: "Algèbre 2 (Linear Maps)",
  instructor: "Pr.Nasreddine",
  price: 1500,
  image: "../Thumbnail/algebre_2/1.png"
},

  etat_de_lart: {
  title: "État de l’art",
  instructor: "Ameziane Sadek",
  price: 800,
  image: "../Thumbnail/etat_de_lart/1.png"
},


  math3_sami_braci: {
  title: "Math 3 – Analyse 3",
  instructor: "Sami Braci",
  price: 2000,
  image: "../Thumbnail/math_3/02.jpg"
},
chimie2: {
  title: "Chimie 2",
  instructor: "Sami Braci",
  price: 2000,
  image: "../Thumbnail/chimie2/01.jpg"
},
machine_electrique: {
  title: "Machine Électrique",
  instructor: "Abdellah Derradj",
  price: 1200,
  image: "../Thumbnail/machine_electrique/08.jpg"
},

les_quadripoles: {
  title: "Les Quadripôles",
  instructor: "Abdellah Derradj",
  price: 1000,
  image: "../Thumbnail/les_quadripoles/01.jpg"
},


  math1: {
    title: "Math 1 – Analyse 1",
    instructor: "Sami Braci",
    price: 2000,
    image: "../Thumbnail/math1/01.jpg"
  },
  chimie1: {
    title: "Chimie 1",
    instructor: "Sami Braci",
    price: 2000,
    image: "../Thumbnail/chimie1/01.jpg"
  },
  physique1: {
    title: "Physique 1",
    instructor: "Sami Braci",
    price: 2000,
    image: "../Thumbnail/physique1/01.jpg"
  },
  physique2: {
    title: "Physique 2",
    instructor: "Sami Braci",
    price: 2000,
    image: "../Thumbnail/physique2/01.jpg"
  },
  math2: {
    title: "Math 2 – Analyse 2",
    instructor: "Sami Braci",
    price: 2000,
    image: "../Thumbnail/math2/01.jpg"
  },

math3_analyse3: {
  title: "Math 3 – Analyse 3",
  instructor: "Abdellah Derradj",
  price: 1200,
  image: "../Thumbnail/math3/01.jpg"
},

  ondes_et_vibrations: { title: "Ondes et Vibrations", instructor: "Abdellah Derradj", price: 1500, image: "../Thumbnail/ondes_et_vibrations/01.jpg" },
  electrotechnique_fondamentale1: { title: "Électrotechnique Fondamentale 1", instructor: "Abdellah Derradj", price: 1500, image: "../Thumbnail/elt_f_1/04.jpg" },
  electronique_fondamentale1: { title: "Électronique Fondamentale 1", instructor: "Abdellah Derradj", price: 1500, image: "../Thumbnail/electroniquef1/01.jpg" },
  informatique01: { title: "Informatique 1", instructor: "Abdellah Derradj", price: 1000, image: "../Thumbnail/informatique1/01.jpg" },
  informatique02: { title: "Informatique 2 (Pascal)", instructor: "Abdellah Derradj", price: 1000, image: "../Thumbnail/Informatique2/02.jpg" },
  informatique03: { title: "Informatique 3 (MATLAB)", instructor: "Abdellah Derradj", price: 1000, image: "../Thumbnail/Informatique3/01.webp" },
  electronique_de_puissance: { title: "Électronique de Puissance (avancée)", instructor: "Abdellah Derradj", price: 1500, image: "../Thumbnail/electronique_de_puissance/03.webp" },
  probabilite_et_statistique: { title: "Probabilité et Statistique", instructor: "Abdellah Derradj", price: 1000, image: "../Thumbnail/statistique/01.jpg" },
  logique_combinatoire_et_sequentielle: { title: "Logique Combinatoire et Séquentielle", instructor: "Abdellah Derradj", price: 1000, image: "../Thumbnail/logique/08.jpg" },
  methodes_numeriques: { title: "Méthodes Numériques (L2 + M1)", instructor: "Abdellah Derradj", price: 1200, image: "../Thumbnail/methode_numerique/01.jpg" },
  systeme_asservis: { title: "Systèmes Asservis", instructor: "Abdellah Derradj", price: 1200, image: "../Thumbnail/systemeasservi/02.jpg" },
  reseaux_electrique: { title: "Réseaux Électriques", instructor: "Abdellah Derradj", price: 1200, image: "../Thumbnail/reseau_electrique/01.jpg" },
  theorie_du_signal: { title: "Théorie du Signal", instructor: "Abdellah Derradj", price: 800, image: "../Thumbnail/theorie_de_signal/02.jpg" },
    theorie_du_champ: { title: "Théorie du Champ Électromagnétique L3", instructor: "Abdellah Derradj", price: 800, image: "../Thumbnail/theorie_champ/03.jpg" },

  bundle_second_year: { title: "باقة السنة الثانية – 5 مواد", instructor: "Abdellah Derradj", price: 4999 }
};

// روابط الصفحات الخاصة بكل مادة
const courseLinks = {
etat_de_lart: "../mycourses-board/etat_de_lart.html",
algebre_2: "../mycourses-board/algebre_2.html",

  math3_analyse3: "../mycourses-board/math3_analyse3.html",
machine_electrique: "../mycourses-board/machine_electrique.html",
les_quadripoles: "../mycourses-board/les_quadripoles.html",

  chimie2: "../mycourses-board/chimie2.html",
  math1: "../mycourses-board/math1.html",
  chimie1: "../mycourses-board/chimie1.html",
  physique1: "../mycourses-board/physique1.html",
  physique2: "../mycourses-board/physique2.html",
  math2: "../mycourses-board/math2.html",
  math3_sami_braci: "../mycourses-board/math3_sami_braci.html",

  ondes_et_vibrations: "../mycourses-board/ondes_et_vibrations.html",
  electrotechnique_fondamentale1: "../mycourses-board/electrotechnique_fondamentale1.html",
  electronique_fondamentale1: "../mycourses-board/electronique_fondamentale1.html",
  informatique01: "../mycourses-board/informatique01.html",
  informatique02: "../mycourses-board/informatique02.html",
  informatique03: "../mycourses-board/informatique03.html",
  electronique_de_puissance: "../mycourses-board/electronique_de_puissance.html",
  probabilite_et_statistique: "../mycourses-board/probabilite_et_statistique.html",
  logique_combinatoire_et_sequentielle : "../mycourses-board/logique_combinatoire_et_sequentielle.html",
  methodes_numeriques: "../mycourses-board/methodes_numeriques.html",
  systeme_asservis: "../mycourses-board/systeme_asservis.html",
  reseaux_electrique: "../mycourses-board/reseaux_electrique.html",
  theorie_du_champ: "../mycourses-board/theorie_du_champ.html",
  theorie_du_signal: "../mycourses-board/theorie_du_signal.html"
};



document.addEventListener("DOMContentLoaded", async () => {
  const userName = localStorage.getItem("userName");
  const contact = localStorage.getItem("userContact");

  if (!userName || !contact) {
    window.location.href = "/login/login.html";
    return;
  }

  // نحاول جلب المواد من قاعدة البيانات، وإن فشلنا نستخدم localStorage كبديل
  let userModules = [];
  try {
    const { data: row, error } = await supabase
      .from("registrations")
      .select("modules")
      .eq("contact", contact)
      .single();

    if (!error && row && Array.isArray(row.modules)) {
      userModules = row.modules;
      localStorage.setItem("userModules", JSON.stringify(userModules));
    } else {
      const raw = localStorage.getItem("userModules");
      if (raw) {
        try { userModules = JSON.parse(raw); } catch (e) { userModules = []; }
      }
    }
  } catch (err) {
    console.error("خطأ عند جلب المواد من الخادم:", err);
    const raw = localStorage.getItem("userModules");
    if (raw) {
      try { userModules = JSON.parse(raw); } catch (e) { userModules = []; }
    }
  }

  const container = document.getElementById("dashboard-courses-container");
  if (!container) return;

  if (!Array.isArray(userModules) || userModules.length === 0) {
    container.innerHTML = "<p style='text-align: center; color:red;'>❌ No registered courses found.</p>";
  } else {
    const fragment = document.createDocumentFragment();
    userModules.forEach((moduleKey) => {
      const course = allCourses[moduleKey];
      if (!course) return; // تفادي الأخطاء عند مفتاح غير معروف
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
          <a href="${courseLinks[moduleKey] || '#'}" class="course-btn">اضغط هنا لمشاهدة الدورة</a>
        </div>
      `;
      fragment.appendChild(card);

      fetchRatings(moduleKey).then(({ average, count }) => {
        const ratingEl = document.getElementById(`rating-${moduleKey}`);
        const reviewsEl = document.getElementById(`reviews-${moduleKey}`);
        if (ratingEl) ratingEl.textContent = average;
        if (reviewsEl) reviewsEl.textContent = `(${count.toLocaleString()})`;
      });
    });
    container.appendChild(fragment);
  }

  // تعبئة قائمة الدورات المتبقية
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
// 💰 إظهار سعر المادة عند اختيارها
const priceInput = document.getElementById("coursePrice");

if (courseSelect && priceInput) {
  courseSelect.addEventListener("change", () => {
    const selectedKey = courseSelect.value;

    if (!selectedKey || !allCourses[selectedKey]) {
      priceInput.value = "";
      priceInput.placeholder = "—";
      return;
    }

    const price = allCourses[selectedKey].price;
    priceInput.value = `${price} DA`;
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
    submitBtn.textContent = "✅تم إرسال الطلب بنجاح، بانتظار الموافقة";
    submitBtn.style.backgroundColor = "#ccc";
    submitBtn.style.cursor = "not-allowed";
    messageDiv.textContent = "⚠️لديك طلب جارٍ قيد المراجعة، لا يمكن إرسال طلب جديد حالياً";
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
// ملاحظة: تم حذف التحقق المكرر من session_id هنا لأننا نعالج التحقق
// في بداية الملف مع سلوك مخفف يتيح عرض الدورات حتى عند اختلاف الجهاز.

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
