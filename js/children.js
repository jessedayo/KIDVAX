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

let editingChildId = null;

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

// Load children
async function loadChildren() {
  try {
    const res = await fetch(`${API}/children`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const children = await res.json();
    renderChildren(children);
  } catch (err) {
    console.error("Failed to load children:", err);
  }
}

// Render children cards
function renderChildren(children) {
  const grid = document.getElementById("children-grid");
  if (children.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👶</div>
        <h3>No children added yet</h3>
        <p>Click "Add Child" to get started</p>
      </div>`;
    return;
  }
  grid.innerHTML = children
    .map(
      (child) => `
    <div class="child-card">
      <div class="child-avatar">${child.gender === "Male" ? "👦" : "👧"}</div>
      <h3>${child.child_name}</h3>
      <p class="text-muted">${calculateAge(child.date_of_birth)} · ${child.gender}</p>
      <p class="text-muted">DOB: ${new Date(child.date_of_birth).toLocaleDateString()}</p>
      <div class="child-card-actions">
        <button class="btn btn-secondary btn-sm" onclick="editChild(${child.child_id}, '${child.child_name}', '${child.date_of_birth.split("T")[0]}', '${child.gender}')">✏️ Edit</button>
        <button class="btn btn-danger btn-sm"    onclick="deleteChild(${child.child_id})">🗑️ Delete</button>
        <button class="btn btn-primary btn-sm"   onclick="window.location.href='vaccines.html?childId=${child.child_id}'">💉 Vaccines</button>
      </div>
    </div>
  `,
    )
    .join("");
}

// Open modal for adding
function openModal() {
  editingChildId = null;
  document.getElementById("modal-title").textContent = "Add Child";
  document.getElementById("child-name").value = "";
  document.getElementById("child-dob").value = "";
  document.getElementById("child-gender").value = "Male";
  document.getElementById("modal-error").style.display = "none";
  document.getElementById("modal").style.display = "flex";
}

// Open modal for editing
function editChild(id, name, dob, gender) {
  editingChildId = id;
  document.getElementById("modal-title").textContent = "Edit Child";
  document.getElementById("child-name").value = name;
  document.getElementById("child-dob").value = dob;
  document.getElementById("child-gender").value = gender;
  document.getElementById("modal-error").style.display = "none";
  document.getElementById("modal").style.display = "flex";
}

// Close modal
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// Save child (add or edit)
async function saveChild() {
  const child_name = document.getElementById("child-name").value;
  const date_of_birth = document.getElementById("child-dob").value;
  const gender = document.getElementById("child-gender").value;
  const modalError = document.getElementById("modal-error");

  if (!child_name || !date_of_birth) {
    modalError.textContent = "All fields are required";
    modalError.style.display = "block";
    return;
  }

  try {
    const url = editingChildId
      ? `${API}/children/${editingChildId}`
      : `${API}/children`;
    const method = editingChildId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ child_name, date_of_birth, gender }),
    });
    const data = await res.json();

    if (!res.ok) {
      modalError.textContent = data.error;
      modalError.style.display = "block";
      return;
    }

    closeModal();
    loadChildren();
  } catch (err) {
    modalError.textContent = "Failed to save child";
    modalError.style.display = "block";
  }
}

// Delete child
async function deleteChild(id) {
  if (!confirm("Are you sure you want to delete this child?")) return;
  try {
    await fetch(`${API}/children/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadChildren();
  } catch (err) {
    console.error("Failed to delete child:", err);
  }
}

loadChildren();
