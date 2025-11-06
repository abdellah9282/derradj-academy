import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://sgcypxmnlyiwljuqvcup.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3lweG1ubHlpd2xqdXF2Y3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTI0MTEsImV4cCI6MjA2NDM2ODQxMX0.iwIikgvioT06uPoXES5IN98TwhtePknCuEQ5UFohfCM"
);
// ✅ منع الدخول لغير الأدمن
if (localStorage.getItem("isAdmin") !== "true") {
  window.location.href = "../index.html"; // 🔄 تحويل للصفحة الرئيسية
}

async function loadRegistrations() {
  const { data, error } = await supabase
    .from("registrations")
    .select("id, full_name, contact, modules, receipt_url, is_approved");

  const pendingTable = document.getElementById("pendingTable");

  pendingTable.innerHTML = "";

  if (error) {
    console.error(error);
    return;
  }

  data.forEach(entry => {
    const status = entry.is_approved;
    const modules = entry.modules || [];
    const statusText = status === true
      ? "✅ Approved"
      : status === false
      ? "❌ Rejected"
      : "⏳ Pending";

    if (status === null) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.full_name}</td>
        <td>${entry.contact}</td>
        <td>${modules.join(", ")}</td>
        <td><a class="link" href="${entry.receipt_url}" target="_blank">View</a></td>
        <td>${statusText}</td>
        <td>
          <button class="approve-btn" data-id="${entry.id}" style="margin-right: 5px;">✅ Approve</button>
          <button class="reject-btn" data-id="${entry.id}" style="color: red;">❌ Reject</button>
        </td>
      `;
      pendingTable.appendChild(row);
    }
  });

  document.querySelectorAll(".approve-btn").forEach(button => {
    button.addEventListener("click", () => updateStatus(button.dataset.id, true));
  });

  document.querySelectorAll(".reject-btn").forEach(button => {
    button.addEventListener("click", () => updateStatus(button.dataset.id, false));
  });
}

async function updateStatus(id, isApproved) {
  const loadingMessage = document.getElementById("loadingMessage");
  const statusMessage = document.getElementById("statusMessage");

  // تأكيد الإجراء
  const action = isApproved ? "approve" : "reject";
  if (!confirm(`Are you sure you want to ${action} this request?`)) return;

  // تعطيل الأزرار أثناء المعالجة
  const buttons = document.querySelectorAll(".approve-btn, .reject-btn");
  buttons.forEach(button => (button.disabled = true));

  // عرض رسالة الانتظار
  loadingMessage.style.display = "block";
  statusMessage.style.display = "none";

  try {
    // التحقق من صحة البيانات قبل إرسال الطلب
    if (!id || typeof isApproved !== "boolean") {
      throw new Error("Invalid data: ID or approval status is missing or incorrect.");
    }

    // تحديث حالة الطلب في جدول Pending Requests
    const { error: updateError } = await supabase
      .from("registrations") // تأكد من أن الجدول هو "registrations"
      .update({ is_approved: isApproved }) // تحديث is_approved إلى true أو false
      .eq("id", id); // استخدام id لتحديد السجل

    if (updateError) {
      console.error("Update Error:", updateError);
      throw new Error("Failed to update is_approved in registrations.");
    }

    // عرض رسالة النجاح
    statusMessage.style.color = "green";
    statusMessage.textContent = `✅ Request ${action}d successfully.`;
    statusMessage.style.display = "block";

    // إعادة تحميل الطلبات الجديدة
    loadRegistrations(); // تأكد من استدعاء الدالة الصحيحة لإعادة تحميل البيانات
  } catch (error) {
    console.error("Error:", error);
    statusMessage.style.color = "red";
    statusMessage.textContent = `❌ ${error.message}`;
    statusMessage.style.display = "block";
  } finally {
    // إعادة تفعيل الأزرار بعد انتهاء المعالجة
    buttons.forEach(button => (button.disabled = false));
    loadingMessage.style.display = "none";
  }
}

async function loadNewRequests() {
  const statusMessage = document.getElementById("statusMessage");

  // جلب الطلبات التي لم تتم مراجعتها فقط (is_approved = null)
  const { data, error } = await supabase
    .from("new_requests")
    .select("id, user_contact, full_name, new_modules, receipt_url, is_approved, created_at")
    .is("is_approved", null) // تصفية الطلبات التي لم تتم مراجعتها فقط
    .order("created_at", { ascending: false });

  console.log("Fetched Data:", data); // طباعة البيانات للتحقق

  const newRequestsTable = document.getElementById("newRequestsTable");
  newRequestsTable.innerHTML = "";

  if (error) {
    console.error(error);
    statusMessage.style.color = "red";
    statusMessage.textContent = "❌ Error loading new requests.";
    statusMessage.style.display = "block";
    return;
  }

  if (!data || data.length === 0) {
    statusMessage.style.color = "orange";
    statusMessage.textContent = "⚠️ No new requests found.";
    statusMessage.style.display = "block";
    return;
  }

  data.forEach(req => {
    const statusText = req.is_approved === true
      ? "✅ Approved"
      : req.is_approved === false
      ? "❌ Rejected"
      : "⏳ Pending";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${req.full_name}</td>
      <td>${req.user_contact}</td>
      <td>${req.new_modules ? req.new_modules.join(", ") : "N/A"}</td>
      <td><a class="link" href="${req.receipt_url}" target="_blank">View</a></td>
      <td>${new Date(req.created_at).toLocaleString()}</td>
      <td>${statusText}</td>
      <td>
        <button class="approve-btn" data-id="${req.id}" style="margin-right: 5px;">✅ Approve</button>
        <button class="reject-btn" data-id="${req.id}" style="color: red;">❌ Reject</button>
      </td>
    `;
    newRequestsTable.appendChild(row);
  });

  document.querySelectorAll(".approve-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      if (!confirm("Are you sure you want to approve this request?")) return;

      const loadingMessage = document.getElementById("loadingMessage");
      const statusMessage = document.getElementById("statusMessage");

      // عرض رسالة الانتظار
      loadingMessage.style.display = "block";
      statusMessage.style.display = "none";

      try {
        // تحديث حالة الطلب في جدول new_requests
        const { error: requestError } = await supabase
          .from("new_requests")
          .update({ is_approved: true })
          .eq("id", id);

        if (requestError) {
          throw new Error("Failed to update request status.");
        }

        statusMessage.style.color = "green";
        statusMessage.textContent = "✅ Request approved successfully.";
        statusMessage.style.display = "block";
        loadNewRequests(); // إعادة تحميل الطلبات لإخفاء الطلب الذي تمت مراجعته
      } catch (error) {
        console.error(error);
        statusMessage.style.color = "red";
        statusMessage.textContent = "❌ Failed to approve request.";
        statusMessage.style.display = "block";
      } finally {
        loadingMessage.style.display = "none";
      }
    });
  });

  document.querySelectorAll(".reject-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      if (!confirm("Are you sure you want to reject this request?")) return;

      const { error: updateError } = await supabase
        .from("new_requests")
        .update({ is_approved: false })
        .eq("id", id);

      if (updateError) {
        console.error(updateError);
        statusMessage.style.color = "red";
        statusMessage.textContent = "❌ Failed to update status.";
        statusMessage.style.display = "block";
        return;
      }

      statusMessage.style.color = "green";
      statusMessage.textContent = "✅ Status updated successfully.";
      statusMessage.style.display = "block";
      loadNewRequests(); // إعادة تحميل الطلبات لإخفاء الطلب الذي تمت مراجعته
    });
  });
}

async function loadMessages() {
  const statusMessage = document.getElementById("statusMessage");

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  const messagesTable = document.getElementById("messagesTable");
  messagesTable.innerHTML = "";

  if (error) {
    console.error(error);
    statusMessage.style.color = "red";
    statusMessage.textContent = "❌ Error loading messages.";
    statusMessage.style.display = "block";
    return;
  }

  data.forEach(msg => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${msg.name}</td>
      <td>${msg.email}</td>
      <td>${msg.message || "N/A"}</td>
      <td>${new Date(msg.created_at).toLocaleString()}</td>
      <td>
        <button onclick="copyToClipboard('${msg.email}')" style="margin-right: 6px;">📋 Copy</button>
        <button onclick="deleteMessage(${msg.id})" style="color:red;">🗑 Delete</button>
      </td>
    `;
    messagesTable.appendChild(row);
  });
}

// ✅ دالة حذف الرسائل (مسجلة في window حتى تعمل مع onclick)
window.deleteMessage = async function (id) {
  const statusMessage = document.getElementById("statusMessage");

  if (!confirm("❌ Are you sure you want to delete this message?")) return;

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    statusMessage.style.color = "red";
    statusMessage.textContent = "❌ Failed to delete message.";
    statusMessage.style.display = "block";
  } else {
    statusMessage.style.color = "green";
    statusMessage.textContent = "🗑 Message deleted successfully.";
    statusMessage.style.display = "block";
    loadMessages();
  }
};

window.copyToClipboard = function (email) {
  navigator.clipboard.writeText(email).then(() => {
    alert("📋 Email copied to clipboard: " + email);
  });
};

window.addEventListener("DOMContentLoaded", () => {
  loadRegistrations();
  loadMessages();
  loadNewRequests(); // أضف هذا السطر
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  // إذا كنت تستخدم supabase auth:
  // await supabase.auth.signOut();

  // امسح بيانات الجلسة من التخزين المحلي (إذا كنت تستخدمها)
  localStorage.clear();
  sessionStorage.clear();

  // إعادة التوجيه لصفحة تسجيل الدخول
  window.location.href = "login.html";
});

const teachersTable = document.getElementById('teachersTable');

async function fetchTeachers() {
  const { data: teachers, error } = await supabase
    .from('new_teachers')
    .select('*')
    .is('is_approved', null) // فقط الذين لم يتم الموافقة عليهم
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching teachers:', error);
    return;
  }

  teachersTable.innerHTML = '';
  teachers.forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.full_name}</td>
      <td>${t.contact}</td>
      <td>${t.subjects}</td>
      <td>${t.cv_url ? `<a href="${t.cv_url}" target="_blank">View CV</a>` : 'No CV'}</td>
      <td>
        <button class="approveBtn" data-id="${t.id}">✅ Approve</button>
        <button class="rejectBtn" data-id="${t.id}">❌ Reject</button>
      </td>
    `;
    teachersTable.appendChild(row);

    // حدث Approve
    row.querySelector('.approveBtn').addEventListener('click', async () => {
      try {
        await supabase
          .from('new_teachers')
          .update({ is_approved: true })
          .eq('id', t.id);

        // إزالة الصف من الجدول مباشرة
        row.remove();
      } catch (err) {
        console.error('Error approving teacher:', err);
        alert('❌ حدث خطأ أثناء الموافقة.');
      }
    });

    // حدث Reject
    row.querySelector('.rejectBtn').addEventListener('click', async () => {
      try {
        await supabase
          .from('new_teachers')
          .delete()
          .eq('id', t.id);

        // إزالة الصف من الجدول مباشرة
        row.remove();
      } catch (err) {
        console.error('Error rejecting teacher:', err);
        alert('❌ حدث خطأ أثناء الرفض.');
      }
    });
  });
}

// استدعاء الدالة عند تحميل الصفحة
fetchTeachers();


// 🎥 عرض المسجلين في جلسات Book Live Sessions (فقط الطلبات المعلقة)
async function loadBookLiveSessions() {
  const tableBody = document.getElementById("bookLiveSessionsBody");
  if (!tableBody) return;


  // 👇 تأخير بسيط حتى تُعرض الرسالة قبل بدء الجلب
  await new Promise(resolve => setTimeout(resolve, 150));

  // ✅ جلب فقط الطلبات التي stat = NULL
  const { data, error } = await supabase
    .from("book_live_sessions")
    .select("*")
    .is("stat", null)
    .order("id", { ascending: false });

  if (error) {
    console.error("⚠️ خطأ في جلب البيانات:", error.message);
    tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">⚠️ فشل تحميل البيانات</td></tr>`;
    return;
  }

  // إذا لم توجد بيانات → اجعل الجدول فارغ تماماً
  if (!data || data.length === 0) {
    tableBody.innerHTML = "";
    return;
  }

  // تفريغ الجدول وإعادة ملئه بالبيانات
  tableBody.innerHTML = "";
  data.forEach((r) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.full_name || "غير محدد"}</td>
      <td>${r.contact || "-"}</td>
      <td>${r.subject || "-"}</td>
      <td>${r.day || "-"}</td>
      <td>⏳ قيد المراجعة</td>
      <td>
        <button class="approveSession" data-id="${r.id}" style="margin-right:4px;">✅ قبول</button>
        <button class="rejectSession" data-id="${r.id}" style="color:red;">❌ رفض</button>
      </td>
    `;
    tableBody.appendChild(row);

    // التعامل مع أزرار القبول والرفض
    const approveBtn = row.querySelector(".approveSession");
    const rejectBtn = row.querySelector(".rejectSession");

    approveBtn.addEventListener("click", () => confirmBeforeAction("accept", r.id, row));
    rejectBtn.addEventListener("click", () => confirmBeforeAction("reject", r.id, row));
  });
}

// ⚠️ دالة التأكيد قبل تنفيذ العملية
function confirmBeforeAction(action, id, rowElement) {
  const actionText = action === "accept" ? "قبول" : "رفض";
  const emoji = action === "accept" ? "✅" : "❌";

  if (confirm(`${emoji} هل أنت متأكد أنك تريد ${actionText} هذا الطلب؟`)) {
    if (action === "accept") {
      updateBookSessionStatus(id, true, rowElement);
    } else {
      deleteBookSession(id, rowElement);
    }
  }
}

// ✅ تحديث حالة الجلسة عند القبول (ثم إخفاء الصف)
async function updateBookSessionStatus(id, status, rowElement) {
  const { error } = await supabase
    .from("book_live_sessions")
    .update({ stat: status })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("⚠️ حدث خطأ أثناء التحديث");
  } else {
    // حذف الصف مباشرة من الجدول بعد القبول
    rowElement.remove();
  }
}

// 🗑️ حذف الجلسة عند الرفض
async function deleteBookSession(id, rowElement) {
  const { error } = await supabase
    .from("book_live_sessions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("⚠️ حدث خطأ أثناء الحذف");
  } else {
    // إزالة الصف من الجدول مباشرة
    rowElement.remove();
  }
}

// ⏱️ تحميل الجلسات عند فتح الصفحة
loadBookLiveSessions();
