document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ JS Loaded (New Auth + Classic UI)");

  const supabase = window.supabase.createClient(
    "https://sgcypxmnlyiwljuqvcup.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM"
  );

  const form = document.querySelector(".signup-form");
  if (!form) {
    console.error("⚠️ لم يتم العثور على الفورم .signup-form");
    return;
  }

  const loginButton = form.querySelector('button[type="submit"]');
  const originalText = loginButton ? loginButton.textContent : "Login";

  // 🧩 توحيد البريد أو رقم الهاتف → إلى email يستخدمه Supabase Auth
  const toAuthEmail = (contact) => {
    let clean = contact.trim().toLowerCase();
    clean = clean.replace(/[^0-9a-zA-Z@.]/g, "");
    if (clean.startsWith("+213")) clean = "0" + clean.slice(4);
    else if (clean.startsWith("213")) clean = "0" + clean.slice(3);
    return clean.includes("@") ? clean : `${clean}@derradjacademy.com`;
  };

  // 🧩 عند الضغط على "تسجيل الدخول"
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!loginButton) return;

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    const contactInput = document.getElementById("contact");
    const passwordInput = document.getElementById("password");

    const contact = contactInput?.value.trim() || "";
    const password = passwordInput?.value.trim() || "";

    if (!contact || !password) {
      loginButton.textContent = "❌ أدخل الرقم و كلمة السر";
      setTimeout(() => {
        loginButton.textContent = originalText;
        loginButton.disabled = false;
      }, 2000);
      return;
    }

    const emailForAuth = toAuthEmail(contact);

    try {
      // 1️⃣ تسجيل الدخول عبر Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: emailForAuth,
          password,
        });

      // ❌ كلمة سر خاطئة أو المستخدم غير موجود
      if (authError || !authData?.user) {
        console.warn("❌ Invalid credentials:", authError);
        loginButton.textContent = "❌ بيانات غير صحيحة";
        setTimeout(() => {
          loginButton.textContent = originalText;
          loginButton.disabled = false;
        }, 2000);
        return;
      }

      // ⭐ 2️⃣ حساب السكرتيرة (بعد نجاح Auth فقط)
      if (contact === "0776922882") {
        const sessionId =
          window.crypto?.randomUUID?.() ||
          Date.now().toString() + Math.random().toString(36).substring(2);
        const deviceId = window.crypto?.randomUUID?.() || "device-" + Date.now();

        localStorage.setItem("sessionId", sessionId);
        localStorage.setItem("deviceId", deviceId);
        localStorage.setItem("userContact", contact);
        localStorage.setItem("userToken", "ok");

        loginButton.textContent = "✅ Welcome secretary";
        window.location.href = "secretary-dashboard/secretary-dashboard.html";
        return;
      }


      // ⭐ 2️⃣ حساب الطالب المسوّق (بعد نجاح Auth فقط)
if (contact === "agent01" || contact === "0562932040") {
  const sessionId =
    window.crypto?.randomUUID?.() ||
    Date.now().toString() + Math.random().toString(36).substring(2);

  const deviceId = window.crypto?.randomUUID?.() || "device-" + Date.now();

  localStorage.setItem("sessionId", sessionId);
  localStorage.setItem("deviceId", deviceId);
  localStorage.setItem("userContact", contact);
  localStorage.setItem("userRole", "student_agent");
  localStorage.setItem("userToken", "ok");

  loginButton.textContent = "✅ Welcome agent";
  window.location.href = "bazoucheazeddine/student-dashboard.html";
  return;
}


      // ⭐ 2️⃣ حساب الأستاذ Bouzida (بعد نجاح Auth فقط)
if (contact === "pr.bouzida") {
  const sessionId =
    window.crypto?.randomUUID?.() ||
    Date.now().toString() + Math.random().toString(36).substring(2);

  const deviceId = window.crypto?.randomUUID?.() || "device-" + Date.now();

  localStorage.setItem("sessionId", sessionId);
  localStorage.setItem("deviceId", deviceId);
  localStorage.setItem("userContact", contact);
  localStorage.setItem("userRole", "bouzida");
  localStorage.setItem("userToken", "ok");

  loginButton.textContent = "👨‍🏫 Welcome Professor Bouzida";

  window.location.href = "bouzida-dashboard/bouzida-home.html";
  return;
}



      // 3️⃣ جلب بيانات المستخدم من جدول registrations (حسب user_id من Auth)
      const { data: reg, error: regError } = await supabase
        .from("registrations")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (regError || !reg) {
        console.error("⚠️ Error loading registration:", regError);
        loginButton.textContent = "⚠️ حسابك غير مكتمل";
        setTimeout(() => {
          loginButton.textContent = originalText;
          loginButton.disabled = false;
        }, 2500);
        return;
      }

      // 4️⃣ حالات خاصة: أدمن / أستاذ / حالة الطلب
      if (reg.is_admin === true) {
        // صلاحيات الأدمن محمية أصلاً بـ RLS على مستوى Supabase
        loginButton.textContent = "✅ Welcome admin";
        window.location.href = "adin-dasbord.html";
        return;
      }

      if (reg.is_teacher === true) {
        const sessionId =
          window.crypto?.randomUUID?.() ||
          Date.now().toString() + Math.random().toString(36).substring(2);
        const deviceId = window.crypto?.randomUUID?.() || "device-" + Date.now();

        localStorage.setItem("sessionId", sessionId);
        localStorage.setItem("deviceId", deviceId);
        localStorage.setItem("userName", reg.full_name || "");
        localStorage.setItem("userContact", reg.contact || "");
        localStorage.setItem(
          "teacherSubjects",
          JSON.stringify(reg.modules || [])
        );
        localStorage.setItem("userToken", "ok");

        await supabase
          .from("registrations")
          .update({ session_id: sessionId, device_id: deviceId })
          .eq("id", reg.id);

        loginButton.textContent = "✅ Welcome teacher";
        window.location.href = "teacher-dashboard.html";
        return;
      }

      if (reg.is_approved === null) {
        loginButton.textContent = "⏳ في انتظار الموافقة";
        setTimeout(() => {
          loginButton.textContent = originalText;
          loginButton.disabled = false;
        }, 2500);
        return;
      }

      if (reg.is_approved === false) {
        loginButton.textContent = "❌ تم رفض الطلب";
        setTimeout(() => {
          loginButton.textContent = originalText;
          loginButton.disabled = false;
        }, 2500);
        return;
      }

      // 5️⃣ نجاح الطالب العادي
      const sessionId =
        window.crypto?.randomUUID?.() ||
        Date.now().toString() + Math.random().toString(36).substring(2);
      const deviceId = window.crypto?.randomUUID?.() || "device-" + Date.now();

      localStorage.setItem("sessionId", sessionId);
      localStorage.setItem("deviceId", deviceId);
      localStorage.setItem("userName", reg.full_name || "");
      localStorage.setItem("userContact", reg.contact || "");
      localStorage.setItem(
        "userModules",
        JSON.stringify(reg.modules || [])
      );
      localStorage.setItem("userToken", "ok");

      await supabase
        .from("registrations")
        .update({ session_id: sessionId, device_id: deviceId })
        .eq("id", reg.id);

      loginButton.textContent = "✅ Welcome";
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("❌ Login error:", err);
      alert("❌ حدث خطأ أثناء تسجيل الدخول.");
      loginButton.textContent = originalText;
      loginButton.disabled = false;
    }
  });
});
