// ✅ تحميل Mux Player إذا استُخدم
import 'https://cdn.jsdelivr.net/npm/@mux/mux-player';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ✅ إعداد Supabase
const supabase = createClient(
  'https://sgcypxmnlyiwljuqvcup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM'
);

// ✅ التحقق الأساسي
function isAuthenticated() {
  const sessionId = localStorage.getItem("sessionId");
  const contact = localStorage.getItem("userContact");
  const token = localStorage.getItem("userToken");
  const deviceId = localStorage.getItem("deviceId");
  return sessionId && contact && deviceId && token === "ok";
}

// ✅ حماية الصفحة بالكامل
async function guardPageAccess() {
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

  if (error || !data || data.session_id !== sessionId || data.device_id !== deviceId) {
    console.warn("🚫 تم تسجيل الدخول من جهاز آخر أو تم إنهاء الجلسة. سيتم تسجيل خروجك الآن.");
    localStorage.clear();
    window.location.href = "/login/login.html";
  } else {
    console.log("✅ الجلسة والجهاز مطابقين.");
    localStorage.setItem("userToken", "ok");
    startPeriodicSessionCheck();
  }
}

function redirectToLogin(reason = "") {
  console.warn("🚫 Redirecting due to:", reason);
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "../login/session_conflict.html";
}

function setupLogoutButton() {
  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "../login/session_conflict.html";
    });
  }
}

function setupSupportForm() {
  const form = document.getElementById('questionForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');
    const supportMsg = document.getElementById('support-message');

    submitBtn.disabled = true;
    submitBtn.textContent = "جاري الإرسال...";
    supportMsg.textContent = "";
    supportMsg.style.color = "green";

    if (!name || !email || !message) {
      supportMsg.textContent = "❌ الرجاء ملء جميع الحقول.";
      supportMsg.style.color = "red";
      submitBtn.disabled = false;
      submitBtn.textContent = "إرسال";
      return;
    }

    const { error } = await supabase
      .from('messages')
      .insert([{ name, email, message }]);

    if (error) {
      supportMsg.textContent = "❌ حدث خطأ أثناء إرسال الرسالة.";
      supportMsg.style.color = "red";
    } else {
      supportMsg.textContent = "✅ تم إرسال رسالتك بنجاح.";
      supportMsg.style.color = "green";
      form.reset();
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "إرسال";
  });
}

function startPeriodicSessionCheck() {
  setInterval(async () => {
    const sessionId = localStorage.getItem("sessionId");
    const deviceId = localStorage.getItem("deviceId");
    const contact = localStorage.getItem("userContact");

    if (!sessionId || !deviceId || !contact) return;

    const { data, error } = await supabase
      .from("registrations")
      .select("session_id, device_id")
      .eq("contact", contact)
      .maybeSingle();

    if (error || !data) return;

    if (data.session_id !== sessionId || data.device_id !== deviceId) {
      console.warn("🚫 تم اكتشاف جلسة/جهاز مختلف. تسجيل الخروج...");
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "../login/session_conflict.html";
    }
  }, 15000);
}

const moduleName = document.body.dataset.module || "chimie1";
let selectedRating = 0;
const stars = document.querySelectorAll('.star');

function highlightStars(value, isHover = false) {
  stars.forEach(star => {
    const val = parseInt(star.dataset.value);
    if (isHover) {
      star.classList.toggle('hovered', val <= value);
    } else {
      star.classList.toggle('selected', val <= value);
      star.classList.remove('hovered');
    }
  });
  const ratingText = document.getElementById("rating-value-display");
  if (ratingText && !isHover) {
    ratingText.textContent = `${value}/5`;
  }
}

stars.forEach(star => {
  star.addEventListener('mouseenter', () => highlightStars(parseInt(star.dataset.value), true));
  star.addEventListener('mouseleave', () => highlightStars(selectedRating, false));
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.value);
    highlightStars(selectedRating, false);
  });
});

async function submitRating() {
  const contact = localStorage.getItem("userContact");
    const full_name = localStorage.getItem("userName"); // 👈 افترضنا أن الاسم الكامل محفوظ في localStorage
  const comment = document.getElementById('userComment').value.trim();
  const messageBox = document.getElementById('ratingMessage');
  const btn = document.getElementById('submitRating');

  if (!contact || selectedRating === 0) {
    messageBox.textContent = "❌ يرجى إدخال بريدك/رقمك واختيار عدد النجوم.";
    messageBox.style.color = "red";
    return;
  }

  btn.disabled = true;
  btn.textContent = "جاري الإرسال...";

  const { data: existingRating } = await supabase
    .from("course_ratings")
    .select("id")
    .eq("contact", contact)
    .eq("module", moduleName)
    .maybeSingle();

  if (existingRating) {
    messageBox.textContent = "❌ لقد قمت بتقييم هذه المادة مسبقًا.";
    messageBox.style.color = "red";
    btn.disabled = true;
    return;
  }

  const { error } = await supabase.from("course_ratings").insert([
    { contact, full_name,module: moduleName, rating: selectedRating, comment }
  ]);

  if (error) {
    messageBox.textContent = "❌ حدث خطأ أثناء الإرسال.";
    messageBox.style.color = "red";
  } else {
    messageBox.textContent = "✅ تم إرسال تقييمك بنجاح!";
    messageBox.style.color = "green";
    btn.disabled = true;
    fetchAverageRating();
  }

  btn.textContent = "إرسال التقييم";
}

async function fetchAverageRating() {
  const display = document.getElementById('average-rating');
  const { data, error } = await supabase
    .from("course_ratings")
    .select("rating")
    .eq("module", moduleName);

  if (data && data.length > 0) {
    const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
    display.textContent = `⭐ متوسط التقييم: ${avg.toFixed(1)} من 5 (${data.length} تقييم)`;
  } else {
    display.textContent = "لا توجد تقييمات بعد";
  }
}
window.addEventListener("DOMContentLoaded", async () => {
  guardPageAccess();
  setupLogoutButton();
  setupSupportForm();
// ✅ اسم المادة الحالية
const moduleName = document.body.dataset.module || "chimie1";

// ✅ تحقق إذا الطالب قام بالتقييم أم لا
(async () => {
  const contact = localStorage.getItem("userContact");
  if (!contact) return;

  const { data, error } = await supabase
    .from("course_ratings")
    .select("id")
    .eq("contact", contact)
    .eq("module", moduleName)
    .maybeSingle();

  if (error) {
    console.error("خطأ في جلب التقييم:", error);
    return;
  }

  if (!data) {
    // 🚨 لم نجد تقييم → أظهر البطاقة
    document.getElementById("rating-popup").style.display = "flex";
  }

  // زر الغلق
  document.getElementById("close-popup").addEventListener("click", () => {
    document.getElementById("rating-popup").style.display = "none";
  });

  // زر الانتقال إلى قسم التقييمات
  document.getElementById("go-to-rating").addEventListener("click", () => {
    document.getElementById("rating-popup").style.display = "none";
    document.getElementById("rating-section").scrollIntoView({ behavior: "smooth" });
  });
})();

  // تقييم الدورة
  const ratingBtn = document.getElementById("submitRating");
  if (ratingBtn) {
    ratingBtn.addEventListener("click", submitRating);
    fetchAverageRating();
  }

  // ✅ حجز الحصة للمادة الحالية فقط
  const bookingBtn = document.getElementById("submitBookingButton");
  const bookingMsg = document.getElementById("booking-message");

  if (bookingBtn) {
    const today = new Date();
    const isSaturday = today.getDay() === 6;
    const userEmail = localStorage.getItem('userContact') || 'anonymous@student.com';

    // احسب بداية الأسبوع من يوم السبت
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    try {
      const { data: bookings, error } = await supabase
        .from("live_sessions")
        .select("*")
        .eq("course_name", moduleName)
        .gte("created_at", startOfWeek.toISOString());

      if (error) {
        console.error("❌ خطأ أثناء التحقق من الحجز:", error);
      }

      // تحقق هل الطالب الحالي هو من حجز الحصة
      const myBooking = bookings && bookings.find(b => b.user_email === userEmail);

      if (myBooking && !isSaturday) {
        if (myBooking.is_approved === true) {
          // تم قبول الجلسة
          const sessionLink = sessionLinks[moduleName] || "#";
          bookingMsg.innerHTML = `✅ حصتك سوف تكون يوم الجمعة على الساعة 18:00 من <a href="${sessionLink}" target="_blank" style="color:#651fff;text-decoration:underline;">هذا الرابط</a>`;
          bookingMsg.style.color = "green";
        } else if (myBooking.is_approved === false) {
          // تم رفض الجلسة
          bookingMsg.textContent = "❌ تم رفض طلبك، حاول مرة أخرى.";
          bookingMsg.style.color = "red";
        } else {
          // is_approved === null أو غير محدد
          bookingMsg.textContent = "...⏳ يتم مراجعة طلبك";
          bookingMsg.style.color = "#888";
        }
        bookingBtn.style.display = "none";
        return;
      }

      if (bookings && bookings.length > 0 && !isSaturday) {
        bookingBtn.style.display = "none";
        if (bookingMsg) {
          bookingMsg.textContent = ".✅ تم حجز الحصة من طرف طالب آخر – يمكنك الحجز للأسبوع المقبل ابتداءً من يوم السبت";
          bookingMsg.style.color = "gray";
        }
        return;
      }

      // ✅ تحقق من المستخدم نفسه إن كان قد حجز سابقًا
      const isSubmittedForModule = localStorage.getItem(`booking_${moduleName}`) === "true";

      if (isSubmittedForModule && !isSaturday) {
        bookingBtn.disabled = true;
        bookingBtn.textContent = "تم الإرسال ✅";
        if (bookingMsg) {
          bookingMsg.textContent = ".لقد قمت بإرسال طلب لهذه المادة. يمكنك إرسال طلب جديد يوم السبت المقبل";
          bookingMsg.style.color = "gray";
        }
      } else if (isSaturday) {
        localStorage.removeItem(`booking_${moduleName}`);
        bookingBtn.disabled = false;
        bookingBtn.textContent = "إرسال الطلب";
        if (bookingMsg) bookingMsg.textContent = "";
      }

    } catch (err) {
      console.error(":❌ خطأ غير متوقع أثناء التحقق من الحجز ", err);
    }
  }
});

window.showReceiptUpload = function () {
  const duration = document.getElementById('sessionDuration').value;
  const section = document.getElementById('uploadSection');
  section.style.display = duration ? 'flex' : 'none';
};
window.submitBooking = async function () {
  const duration = document.getElementById('sessionDuration').value;
  const file = document.getElementById('paymentReceipt').files[0];
  const courseName = moduleName || 'unknown';
  const userEmail = localStorage.getItem('userContact') || 'anonymous@student.com';
  const submitBtn = document.getElementById('submitBookingButton');
  const msgBox = document.getElementById('booking-message');

  if (!duration || !file) {
    msgBox.textContent = "❌ يرجى اختيار مدة الجلسة ورفع الوصل.";
    msgBox.style.color = "red";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "⏳ جاري إرسال الطلب...";
  msgBox.textContent = "";

  try {
    // رفع الوصل
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from('receipts')
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      msgBox.textContent = "❌ فشل في رفع الوصل.";
      msgBox.style.color = "red";
      submitBtn.disabled = false;
      submitBtn.textContent = "إرسال الطلب";
      return;
    }

    const receiptUrl = `https://sgcypxmnlyiwljuqvcup.supabase.co/storage/v1/object/public/receipts/${fileName}`;

    // حفظ البيانات
    const { error: insertError } = await supabase
      .from('live_sessions')
      .insert([
        {
          user_email: userEmail,
          duration: parseInt(duration),
          course_name: courseName,
          receipt_url: receiptUrl
        }
      ]);

    if (insertError) {
      console.error(insertError);
      msgBox.textContent = "❌ لم يتم حفظ الحجز. حاول مرة أخرى.";
      msgBox.style.color = "red";
      submitBtn.disabled = false;
      submitBtn.textContent = "إرسال الطلب";
      return;
    }

    // نجاح
    msgBox.textContent = "✅ تم إرسال الطلب بنجاح. ستكون حصتك يوم الجمعة المقبل على الساعة 18:00.";
    msgBox.style.color = "green";
    submitBtn.textContent = "تم الإرسال ✅";
    submitBtn.disabled = true;

    document.getElementById('sessionDuration').value = "";
    document.getElementById('paymentReceipt').value = "";
    document.getElementById('uploadSection').style.display = 'none';

    // منع الإرسال حتى السبت
localStorage.setItem(`booking_${moduleName}`, "true");

  } catch (err) {
    console.error(err);
    msgBox.textContent = "❌ حدث خطأ غير متوقع. حاول لاحقًا.";
    msgBox.style.color = "red";
    submitBtn.disabled = false;
    submitBtn.textContent = "إرسال الطلب";
  }
};

// روابط الجلسات الثابتة لكل مادة
const sessionLinks = {
  electricite_industrielle: "https://www.youtube.com/?bp=wgUCEAE%3D",
  electronique_fondamentale1: "https://your-link.com/electronique_fondamentale1",
  electrotechnique_fondamentale1: "https://your-link.com/electrotechnique_fondamentale1",
  ondes_et_vibrations: "https://your-link.com/ondes_et_vibrations"
};
// ✅ عرض الاسم في رسالة الترحيب
window.addEventListener("DOMContentLoaded", () => {
const username = localStorage.getItem("userName") || "User";
  const nameSpan = document.getElementById("username");
  if (nameSpan) nameSpan.textContent = username;
});
