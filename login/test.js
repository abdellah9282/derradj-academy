document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ JS Loaded (New Auth + Classic UI)");

  const supabase = window.supabase.createClient(
    "https://sgcypxmnlyiwljuqvcup.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM"
  );

  const form = document.querySelector(".signup-form");
  const loginButton = form.querySelector('button[type="submit"]');
  const originalText = loginButton.textContent;

  // 🧩 توحيد البريد أو رقم الهاتف
  const toAuthEmail = (contact) => {
    let clean = contact.trim().toLowerCase();
    clean = clean.replace(/[^0-9a-zA-Z@.]/g, "");
    if (clean.startsWith("+213")) clean = "0" + clean.slice(4);
    else if (clean.startsWith("213")) clean = "0" + clean.slice(3);
    return clean.includes("@") ? clean : `${clean}@derradjacademy.com`;
  };

  // 🧩 تسجيل الدخول بالطريقة القديمة (fallback)
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
      localStorage.setItem("teacherSubjects", JSON.stringify(data.modules || []));
    }

    await supabase
      .from("registrations")
      .update({ session_id: sessionId, device_id: deviceId })
      .eq("contact", data.contact);

    // ✅ واجهة المستخدم
    if (data.is_admin === true) {
      loginButton.textContent = "✅ Welcome admin";
      localStorage.setItem("isAdmin", "true");
      window.location.href = "adin-dasbord.html";
    } else if (data.is_teacher === true) {
      loginButton.textContent = "✅ Welcome teacher";
      window.location.href = "teacher-dashboard.html";
    } else {
      loginButton.textContent = "✅ Welcome student";
      window.location.href = "dashboard.html";
    }

    return { ok: true };
  }

  // 🧩 عند الضغط على "تسجيل الدخول"
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";

  const contact = document.getElementById("contact").value.trim();
  const password = document.getElementById("password").value.trim();

  // 🟣 شرط خاص بالسكرتيرة (دخول مباشر بدون alert)
  if (contact === "0776922882" && password === "rania829") {
    localStorage.setItem("userContact", contact);
    window.location.href = "secretary-dashboard/secretary-dashboard.html";
    return; // 🛑 نوقف باقي الكود هنا
  }


  // بعد هذا السطر، يُكمل الكود الطبيعي لأي مستخدم آخر
  const emailForAuth = toAuthEmail(contact);

  try {
    // 1️⃣ تسجيل الدخول عبر Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: emailForAuth,
        password,
      });

if (authError || !authData?.user) {
  // 2️⃣ فشل → نجرب النظام القديم
  const fb = await fallbackTableLogin(contact, password);

  if (!fb.ok) {
    console.log("🔎 Trying book_live_sessions as last resort...");

    // 🔹 تحقق من الحجز في جدول book_live_sessions
    const { data: bookRows, error: bookErr } = await supabase
      .from("book_live_sessions")
      .select("*")
      .eq("contact", contact)
      .eq("password", password)
      .limit(1);

    if (bookErr) {
      console.error("⚠️ Error checking book_live_sessions:", bookErr);
      loginButton.textContent = "⚠️ Server error";
      setTimeout(() => {
        loginButton.textContent = originalText;
        loginButton.disabled = false;
      }, 2000);
      return;
    }

    if (!bookRows || bookRows.length === 0) {
      // ❌ لا يوجد في أي نظام
      loginButton.textContent = "❌ بيانات غير صحيحة";
      setTimeout(() => {
        loginButton.textContent = originalText;
        loginButton.disabled = false;
      }, 2000);
      return;
    }

    // ✅ وُجد في جدول الحصص
    const student = bookRows[0];
    console.log("✅ Found in book_live_sessions:", student.full_name);

    // حفظ البيانات محليًا
    localStorage.setItem("userName", student.full_name);
    localStorage.setItem("userContact", student.contact);
    localStorage.setItem("userToken", "ok");
    localStorage.setItem("source", "book_live_sessions");

// 🔹 التحقق من حالة الحصة بدقة
if (student.stat === true) {
  loginButton.textContent = " تم تأكيد حصتك ✅";
  setTimeout(() => {
    window.location.href = "live-dashboard.html"; // ✅ صفحة البث المباشر
  }, 1200);
} else if (student.stat === false) {
  loginButton.textContent = "❌ تم رفض الحصة";
  setTimeout(() => {
    window.location.href = "live-dashboard.html"; // ❌ صفحة مخصصة للرفض أو نفسها
  }, 1500);
} else {
  loginButton.textContent = "⏳ في انتظار تأكيد الحصة";
  setTimeout(() => {
    window.location.href = "live-dashboard.html"; // ⏳ صفحة انتظار
  }, 1500);
}
return;

  }

  // إذا نجحت fallbackTableLogin، نخرج هنا
  return;
}


      // ✅ نجاح Auth → نحضر البيانات من جدول registrations
      let { data: reg } = await supabase
        .from("registrations")
        .select("*")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (!reg) {
        const { data: byContact } = await supabase
          .from("registrations")
          .select("*")
          .or(`contact.eq.${contact},contact.eq.${emailForAuth}`)
          .maybeSingle();
        reg = byContact || reg;
      }

      if (!reg) {
        alert("تم تسجيل الدخول، لكن لا توجد بياناتك في registrations. تواصل مع الدعم.");
        loginButton.textContent = originalText;
        loginButton.disabled = false;
        return;
      }

      // ✅ حالات الموافقة والرفض
      if (reg.is_admin === true) {
        loginButton.textContent = "✅ Welcome admin";
        window.location.href = "adin-dasbord.html";
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
        loginButton.textContent = "❌ Rejected. Please register again.";
        setTimeout(() => {
          loginButton.textContent = originalText;
          loginButton.disabled = false;
        }, 2500);
        return;
      }

      // ✅ الجلسة والمعلومات المحلية
      const sessionId =
        window.crypto?.randomUUID?.() ||
        Date.now().toString() + Math.random().toString(36).substring(2);
      const deviceId = window.crypto?.randomUUID?.() || "device-" + Date.now();

      localStorage.setItem("sessionId", sessionId);
      localStorage.setItem("deviceId", deviceId);
      localStorage.setItem("userModules", JSON.stringify(reg.modules));
      localStorage.setItem("userName", reg.full_name);
      localStorage.setItem("userContact", reg.contact);
      localStorage.setItem("userToken", "ok");

      if (reg.is_teacher === true) {
        localStorage.setItem("teacherSubjects", JSON.stringify(reg.modules || []));
      }

      await supabase
        .from("registrations")
        .update({ session_id: sessionId, device_id: deviceId })
        .eq("contact", reg.contact);

      // ✅ واجهة المستخدم عند النجاح
      if (reg.is_teacher === true) {
        loginButton.textContent = "✅ Welcome teacher";
        window.location.href = "teacher-dashboard.html";
      } else {
        loginButton.textContent = "✅ Welcome student";
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
