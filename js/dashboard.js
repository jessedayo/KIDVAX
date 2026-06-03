const API = "http://localhost:5000/api";
const token = localStorage.getItem("kidvax_token");
const user = JSON.parse(localStorage.getItem("kidvax_user"));

// Redirect to login if not logged in
if (!token) window.location.href = "../index.html";

// Show user name
document.getElementById("user-name").textContent =
  "👋 " + user.fullname.split(" ")[0];
document.getElementById("welcome-name").textContent =
  user.fullname.split(" ")[0];

// Logout
function logout() {
  localStorage.removeItem("kidvax_token");
  localStorage.removeItem("kidvax_user");
  window.location.href = "../index.html";
}

// Calculate age
function calculateAge(dob) {
  const birth = new Date(dob);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (months < 24) return `${months} months`;
  return `${Math.floor(months / 12)} years`;
}

// Load dashboard data
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/children`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const children = await res.json();

    document.getElementById("total-children").textContent = children.length;

    let totalCompleted = 0;
    let totalUpcoming = 0;

    for (const child of children) {
      const vacRes = await fetch(`${API}/vaccines/records/${child.child_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const records = await vacRes.json();
      totalCompleted += records.filter((r) => r.status === "completed").length;
      totalUpcoming += records.filter((r) => r.status === "pending").length;
    }

    document.getElementById("total-completed").textContent = totalCompleted;
    document.getElementById("total-upcoming").textContent = totalUpcoming;

    const list = document.getElementById("children-list");
    if (children.length === 0) {
      list.innerHTML = `<p class="text-muted">No children added yet. <a href="children.html">Add a child</a> to get started.</p>`;
      return;
    }

    list.innerHTML = children
      .map(
        (child) => `
      <a class="child-summary-card" href="vaccines.html?childId=${child.child_id}">
        <h3>${child.gender === "Male" ? "👦" : "👧"} ${child.child_name}</h3>
        <p class="text-muted">${calculateAge(child.date_of_birth)} · ${child.gender}</p>
        <p class="text-muted" style="margin-top: 8px; font-size: 13px;">Click to view vaccines →</p>
      </a>
    `,
      )
      .join("");
  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

loadDashboard();
