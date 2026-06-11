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

    // Update localStorage with new name
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

      // Clear localStorage and redirect to register
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
}
