const API = "http://localhost:5000/api";
const token = localStorage.getItem("kidvax_token");
const user = JSON.parse(localStorage.getItem("kidvax_user"));

// Redirect if not logged in
if (!token) window.location.href = "../index.html";

// Show user name
document.getElementById("user-name").textContent =
  "👋 " + user.fullname.split(" ")[0];

// Pre-fill name field
document.getElementById("new-name").value = user.fullname;

// Logout
function logout() {
  localStorage.removeItem("kidvax_token");
  localStorage.removeItem("kidvax_user");
  window.location.href = "../index.html";
}

// Password strength checker
function checkStrength() {
  const password = document.getElementById("new-password").value;
  const bar1 = document.getElementById("bar1");
  const bar2 = document.getElementById("bar2");
  const bar3 = document.getElementById("bar3");
  const bar4 = document.getElementById("bar4");
  const text = document.getElementById("strength-text");

  if (!bar1) return;

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  document.getElementById("req-length").innerHTML =
    `${hasLength ? "✅" : "❌"} At least 8 characters`;
  document.getElementById("req-upper").innerHTML =
    `${hasUpper ? "✅" : "❌"} At least one uppercase letter`;
  document.getElementById("req-number").innerHTML =
    `${hasNumber ? "✅" : "❌"} At least one number`;
  document.getElementById("req-special").innerHTML =
    `${hasSpecial ? "✅" : "❌"} At least one special character (!@#$...)`;

  const strength = [hasLength, hasUpper, hasNumber, hasSpecial].filter(
    Boolean,
  ).length;
  const bars = [bar1, bar2, bar3, bar4];
  const colors = { 1: "#C62828", 2: "#F57F17", 3: "#43A047", 4: "#2E7D32" };
  const labels = {
    0: "",
    1: "❌ Weak",
    2: "⚠️ Fair",
    3: "✅ Good",
    4: "💪 Strong",
  };

  bars.forEach((bar, i) => {
    bar.style.background = i < strength ? colors[strength] : "var(--border)";
  });

  text.textContent = labels[strength];
  text.style.color = colors[strength] || "var(--text-muted)";
}

// Update name
async function updateName() {
  const fullname = document.getElementById("new-name").value;
  const errorMsg = document.getElementById("name-error");
  const successMsg = document.getElementById("name-success");

  errorMsg.style.display = "none";
  successMsg.style.display = "none";

  if (!fullname) {
    errorMsg.textContent = "Name is required";
    errorMsg.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API}/user/update-name`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fullname }),
    });
    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.error;
      errorMsg.style.display = "block";
      return;
    }

    const updatedUser = { ...user, fullname };
    localStorage.setItem("kidvax_user", JSON.stringify(updatedUser));

    successMsg.textContent = data.message;
    successMsg.style.display = "block";
    document.getElementById("user-name").textContent =
      "👋 " + fullname.split(" ")[0];
  } catch (err) {
    errorMsg.textContent = "Failed to update name";
    errorMsg.style.display = "block";
  }
}

// Update password
async function updatePassword() {
  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const errorMsg = document.getElementById("pass-error");
  const successMsg = document.getElementById("pass-success");

  errorMsg.style.display = "none";
  successMsg.style.display = "none";

  if (!currentPassword || !newPassword || !confirmPassword) {
    errorMsg.textContent = "All fields are required";
    errorMsg.style.display = "block";
    return;
  }

  if (newPassword !== confirmPassword) {
    errorMsg.textContent = "New passwords do not match";
    errorMsg.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API}/user/update-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.error;
      errorMsg.style.display = "block";
      return;
    }

    successMsg.textContent = data.message;
    successMsg.style.display = "block";
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
  } catch (err) {
    errorMsg.textContent = "Failed to update password";
    errorMsg.style.display = "block";
  }
}

// Delete account
async function deleteMyAccount() {
  if (
    !confirm(
      "Are you sure? This will permanently delete your account and all your data!",
    )
  )
    return;
  if (!confirm("This cannot be undone. Are you absolutely sure?")) return;

  try {
    const res = await fetch(`${API}/user/delete`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) {
      document.getElementById("delete-error").textContent = data.error;
      document.getElementById("delete-error").style.display = "block";
      return;
    }

    localStorage.removeItem("kidvax_token");
    localStorage.removeItem("kidvax_user");
    alert("Your account has been deleted.");
    window.location.href = "../index.html";
  } catch (err) {
    document.getElementById("delete-error").textContent =
      "Failed to delete account";
    document.getElementById("delete-error").style.display = "block";
  }
}
