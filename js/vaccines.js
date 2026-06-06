const API = "http://localhost:5000/api";
const token = localStorage.getItem("kidvax_token");
const user = JSON.parse(localStorage.getItem("kidvax_user"));
const urlParams = new URLSearchParams(window.location.search);
const childId = urlParams.get("childId");

// Redirect if not logged in
if (!token) window.location.href = "../index.html";
if (!childId) window.location.href = "children.html";

// Show user name
document.getElementById("user-name").textContent =
  "👋 " + user.fullname.split(" ")[0];

// Logout
function logout() {
  localStorage.removeItem("kidvax_token");
  localStorage.removeItem("kidvax_user");
  window.location.href = "../index.html";
}

let allRecords = [];
let childName = "";

// Get auto status based on due date
function getAutoStatus(record) {
  if (record.status === "completed") return "completed";
  const today = new Date();
  const dueDate = new Date(record.due_date);
  const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  if (daysUntil > 14) return "future";
  if (daysUntil <= 14 && daysUntil > 0) return "upcoming";
  if (daysUntil >= -7) return "due_today";
  return "missed";
}

// Get badge HTML based on status
function getStatusBadge(record) {
  const status = getAutoStatus(record);
  if (status === "completed")
    return `<span class="badge badge-completed">✅ Completed</span>`;
  if (status === "upcoming")
    return `<span class="badge badge-upcoming">🟡 Due Soon</span>`;
  if (status === "due_today")
    return `<span class="badge badge-due">🟢 Due Now</span>`;
  if (status === "missed")
    return `<span class="badge badge-missed">🔴 Overdue</span>`;
  return `<span class="badge badge-future">⬜ Scheduled</span>`;
}

// Load vaccine records
async function loadRecords() {
  try {
    // Get child name
    const childRes = await fetch(`${API}/children`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const children = await childRes.json();
    const child = children.find((c) => c.child_id === parseInt(childId));
    if (child) {
      childName = child.child_name;
      document.getElementById("page-title").textContent =
        `💉 ${childName}'s Vaccines`;
    }

    // Get vaccine records
    const res = await fetch(`${API}/vaccines/records/${childId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    allRecords = await res.json();
    renderRecords();
  } catch (err) {
    document.getElementById("error-msg").textContent =
      "Failed to load vaccine records";
    document.getElementById("error-msg").style.display = "block";
  }
}

// Render records to table
function renderRecords() {
  const completed = allRecords.filter((r) => r.status === "completed").length;
  const upcoming = allRecords.filter(
    (r) => getAutoStatus(r) === "upcoming",
  ).length;
  const missed = allRecords.filter((r) => getAutoStatus(r) === "missed").length;
  const total = allRecords.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  document.getElementById("total-completed").textContent = completed;
  document.getElementById("total-upcoming").textContent = upcoming;
  document.getElementById("total-missed").textContent = missed;
  document.getElementById("progress-pct").textContent = `${pct}%`;
  document.getElementById("progress-bar").style.width = `${pct}%`;
  document.getElementById("progress-text").textContent =
    `${completed} of ${total} vaccines completed`;

  const tbody = document.getElementById("vaccine-records");
  tbody.innerHTML = allRecords
    .map(
      (record) => `
    <tr>
      <td><strong>${record.vaccine_name}</strong></td>
      <td>${record.recommended_age}</td>
      <td>${new Date(record.due_date).toLocaleDateString()}</td>
      <td>${getStatusBadge(record)}</td>
      <td>${record.vaccination_date ? new Date(record.vaccination_date).toLocaleDateString() : "—"}</td>
      <td>
        ${
          record.status !== "completed"
            ? `
          <button class="vaccine-card-btn" onclick="markCompleted(${record.record_id})">
            ✅ Mark Done
          </button>`
            : "—"
        }
      </td>
    </tr>
  `,
    )
    .join("");
}

// Mark vaccine as completed
async function markCompleted(recordId) {
  try {
    const today = new Date().toISOString().split("T")[0];
    await fetch(`${API}/vaccines/records/${recordId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "completed", vaccination_date: today }),
    });
    loadRecords();
  } catch (err) {
    console.error("Failed to update vaccine:", err);
  }
}

// Download PDF
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Header
  doc.setFillColor(46, 125, 50);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("KIDVAX", 14, 15);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Child Vaccination Tracking System", 14, 23);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  // Child name
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Vaccination Card — ${childName}`, 14, 50);

  // Table
  doc.autoTable({
    startY: 58,
    head: [["Vaccine", "Recommended Age", "Due Date", "Status", "Date Given"]],
    body: allRecords.map((r) => [
      r.vaccine_name,
      r.recommended_age,
      new Date(r.due_date).toLocaleDateString(),
      r.status === "completed"
        ? "Completed"
        : getAutoStatus(r) === "upcoming"
          ? "Upcoming"
          : getAutoStatus(r) === "due_today"
            ? "Due Now"
            : getAutoStatus(r) === "missed"
              ? "Overdue"
              : "Scheduled",
      r.vaccination_date
        ? new Date(r.vaccination_date).toLocaleDateString()
        : "—",
    ]),
    headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [232, 245, 233] },
    styles: { fontSize: 9 },
  });

  doc.save(`${childName}_vaccination_card.pdf`);
}

loadRecords();
