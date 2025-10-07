document.addEventListener("DOMContentLoaded", () => {
  const supabase = window.supabase.createClient(
    "https://sgcypxmnlyiwljuqvcup.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM"
  );


  const form = document.querySelector(".signup-form");
  const loginButton = form.querySelector('button[type="submit"]');
  const originalText = loginButton.textContent;

  // ✅ دالة لتوحيد البريد أو رقم الهاتف
  const toAuthEmail = (contact) => {
    let clean = contact.trim().toLowerCase();
    clean = clean.replace(/[^0-9a-zA-Z@.]/g, ""); // إزالة الرموز غير الضرورية
    if (clean.startsWith("+213")) clean = "0" + clean.slice(4);
    else if (clean.startsWith("213")) clean = "0" + clean.slice(3);
    // إن لم يحتوِ على @ نحوله إلى بريد خاص بالأكاديمية
    return clean.includes("@") ? clean : `${clean}@derradjacademy.com`;
  };

  // ✅ تسجيل دخول النسخة القديمة (fallback)
  async function fallbackTableLogin(contact, password) {
    console.log("🔎 Trying fallbackTableLogin for:", contact);

    const { data: rows, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("contact", contact);

    if (error || !rows || rows.length === 0) {
      console.warn("⚠️ User not found in fallbackTableLogin");
      return { ok: false };
    }

    const data = rows.find((u) => u.password === password);
    if (!data) {
      console.warn("⚠️ Password mismatch");
      return { ok: false };
    }

    console.log("✅ Fallback success:", data.full_name);

    const sessionId = window.crypto?.randomUUID?.() || Date.now().toString();
    const deviceId = window.crypto?.randomUUID?.() || "device-" + Date.now();

    localStorage.setItem("sessionId", sessionId);
    localStorage.setItem("deviceId", deviceId);
    localStorage.setItem("userModules", JSON.stringify(data.modules));
    localStorage.setItem("userName", data.full_name);
    localStorage.setItem("userContact", data.contact);
    localStorage.setItem("userToken", "ok");

    if (data.is_teacher) {
      localStorage.setItem(
        "teacherSubjects",
        JSON.stringify(data.modules || [])
      );
    }

    await supabase
      .from("registrations")
      .update({ session_id: sessionId, device_id: deviceId })
      .eq("contact", data.contact);

    // ✅ التحويل حسب نوع المستخدم
    if (data.is_admin === true) {
      localStorage.setItem("isAdmin", "true");
      window.location.href = "adin-dasbord.html";
    } else if (data.is_teacher === true) {
      window.location.href = "teacher-dashboard.html";
    } else {
      window.location.href = "dashboard.html";
    }

    return { ok: true };
  }

  // ✅ حدث عند الضغط على زر "تسجيل الدخول"
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    const contact = document.getElementById("contact").value.trim();
    const password = document.getElementById("password").value.trim();
    const emailForAuth = toAuthEmail(contact);

    try {
      // 🧩 أولاً: نحاول الدخول عبر Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: emailForAuth,
          password,
        });

      if (authError || !authData?.user) {
        // ⚠️ فشل الدخول الحديث → نجرّب النظام القديم
        const fb = await fallbackTableLogin(contact, password);
        if (!fb.ok) {
          loginButton.textContent = "❌ معلومات غير صحيحة";
          setTimeout(() => {
            loginButton.textContent = originalText;
            loginButton.disabled = false;
          }, 1800);
        }
        return;
      }

      // ✅ نجاح الدخول عبر Supabase
      let { data: reg } = await supabase
        .from("registrations")
        .select("*")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      // 🧩 احتياط: لو لم نجد السطر عن طريق user_id
      if (!reg) {
        const { data: byContact } = await supabase
          .from("registrations")
          .select("*")
          .or(`contact.eq.${contact},contact.eq.${emailForAuth}`)
          .maybeSingle();
        reg = byContact || reg;
      }

      if (!reg) {
        alert(
          "تم تسجيل الدخول بنجاح، ولكن لا توجد بياناتك في جدول registrations. يرجى التواصل مع الدعم."
        );
        loginButton.textContent = originalText;
        loginButton.disabled = false;
        return;
      }

      // ✅ تحقق من حالة الموافقة
      if (reg.is_admin === true) {
        localStorage.setItem("isAdmin", "true");
        window.location.href = "adin-dasbord.html";
        return;
      }
      if (reg.is_approved === null) {
        loginButton.textContent = "⏳ في انتظار الموافقة";
        setTimeout(() => {
          loginButton.textContent = originalText;
          loginButton.disabled = false;
        }, 2000);
        return;
      }
      if (reg.is_approved === false) {
        loginButton.textContent = "❌ تم الرفض. الرجاء التسجيل مجددًا.";
        setTimeout(() => {
          loginButton.textContent = originalText;
          loginButton.disabled = false;
        }, 2000);
        return;
      }

      // ✅ تخزين الجلسة محليًا
      const sessionId =
        window.crypto?.randomUUID?.() ||
        Date.now().toString() + Math.random().toString(36).slice(2);
      const deviceId = window.crypto?.randomUUID?.() || "device-" + Date.now();

      localStorage.setItem("sessionId", sessionId);
      localStorage.setItem("deviceId", deviceId);
      localStorage.setItem("userModules", JSON.stringify(reg.modules));
      localStorage.setItem("userName", reg.full_name);
      localStorage.setItem("userContact", reg.contact);
      localStorage.setItem("userToken", "ok");

      if (reg.is_teacher) {
        localStorage.setItem(
          "teacherSubjects",
          JSON.stringify(reg.modules || [])
        );
      }

      await supabase
        .from("registrations")
        .update({ session_id: sessionId, device_id: deviceId })
        .eq("contact", reg.contact);

      // ✅ تحويل المستخدم للصفحة الصحيحة
      if (reg.is_teacher === true) {
        window.location.href = "teacher-dashboard.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } catch (err) {
      console.error(err);
      alert("❌ حدث خطأ أثناء تسجيل الدخول.");
      loginButton.textContent = originalText;
      loginButton.disabled = false;
    }
  });
});
