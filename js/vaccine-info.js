const API = "http://localhost:5000/api";
const token = localStorage.getItem("kidvax_token");
const user = JSON.parse(localStorage.getItem("kidvax_user"));

// Redirect if not logged in
if (!token) window.location.href = "../index.html";

// Show user name
document.getElementById("user-name").textContent =
  "👋 " + user.fullname.split(" ")[0];

// Logout
function logout() {
  localStorage.removeItem("kidvax_token");
  localStorage.removeItem("kidvax_user");
  window.location.href = "../index.html";
}

let allVaccines = [];

// Load all vaccines
async function loadVaccines() {
  try {
    const res = await fetch(`${API}/vaccines/schedule`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    allVaccines = await res.json();
    renderVaccines(allVaccines);
  } catch (err) {
    console.error("Failed to load vaccines:", err);
  }
}

// Render vaccines to table
function renderVaccines(vaccines) {
  const tbody = document.getElementById("vaccine-list");
  if (vaccines.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-muted">No vaccines found</td></tr>`;
    return;
  }
  tbody.innerHTML = vaccines
    .map(
      (v, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${v.vaccine_name}</strong></td>
      <td><span class="badge badge-upcoming">${v.recommended_age}</span></td>
      <td>${v.description}</td>
    </tr>
  `,
    )
    .join("");
}

// Filter vaccines by search
function filterVaccines() {
  const search = document.getElementById("search").value.toLowerCase();
  const filtered = allVaccines.filter(
    (v) =>
      v.vaccine_name.toLowerCase().includes(search) ||
      v.recommended_age.toLowerCase().includes(search),
  );
  renderVaccines(filtered);
}

loadVaccines();
