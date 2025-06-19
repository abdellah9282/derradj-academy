document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ JS is loaded");

  const supabase = window.supabase.createClient(
    "https://sgcypxmnlyiwljuqvcup.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM"
  );

  const form = document.querySelector(".signup-form");
  const loginButton = form.querySelector('button[type="submit"]');
  const originalText = loginButton.textContent;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    const contact = document.getElementById("contact").value.trim();
    const password = document.getElementById("password").value.trim();

    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("contact", contact)
      .eq("password", password)
      .single();

    if (error || !data) {
      loginButton.textContent = "❌ Incorrect info";
      setTimeout(() => {
        loginButton.textContent = originalText;
        loginButton.disabled = false;
      }, 2000);
      return;
    }

    // ✅ Admin
    if (data.is_admin === true) {
      loginButton.textContent = "✅ Welcome admin";
      localStorage.setItem("isAdmin", "true");
      window.location.href = "admin-dashboard.html";
      return;
    }

    // ⏳ Awaiting approval
    if (data.is_approved === null) {
      loginButton.textContent = "⏳ Awaiting approval";
      setTimeout(() => {
        loginButton.textContent = originalText;
        loginButton.disabled = false;
      }, 2500);
      return;
    }

    // ❌ Rejected
    if (data.is_approved === false) {
      loginButton.textContent = "❌ Rejected. Please register again.";
      setTimeout(() => {
        loginButton.textContent = originalText;
        loginButton.disabled = false;
      }, 2500);
      return;
    }

    // ✅ Approved user → إنشاء session و device_id
    const sessionId = (window.crypto?.randomUUID?.() || Date.now().toString() + Math.random().toString(36).substring(2));
    const deviceId = (window.crypto?.randomUUID?.() || "device-" + Date.now());

    // تخزين محلي مشترك
    localStorage.setItem("sessionId", sessionId);
    localStorage.setItem("deviceId", deviceId);
    localStorage.setItem("userModules", JSON.stringify(data.modules));
    localStorage.setItem("userName", data.full_name);
    localStorage.setItem("userContact", data.contact);
    localStorage.setItem("userToken", "ok");

    // إذا كان الأستاذ خزّن مواد التدريس في localStorage
    if (data.is_teacher === true) {
      localStorage.setItem("teacherSubjects", JSON.stringify(data.modules || []));
    }

    await supabase
      .from("registrations")
      .update({
        session_id: sessionId,
        device_id: deviceId
      })
      .eq("contact", data.contact);

    // تحويل حسب نوع المستخدم
    if (data.is_teacher === true) {
      loginButton.textContent = "✅ Welcome teacher";
      window.location.href = "teacher-dashboard.html";
    } else {
      loginButton.textContent = "✅ Welcome student";
      window.location.href = "dashboard.html";
    }
  });
});
