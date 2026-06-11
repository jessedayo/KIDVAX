const API = "http://localhost:5000/api";

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

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

if (!token) window.location.href = "../index.html";

const resetForm = document.getElementById("reset-form");
if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const errorMsg = document.getElementById("error-msg");
    const successMsg = document.getElementById("success-msg");

    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    if (newPassword !== confirmPassword) {
      errorMsg.textContent = "Passwords do not match";
      errorMsg.style.display = "block";
      return;
    }

    try {
      const res = await fetch(`${API}/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.error;
        errorMsg.style.display = "block";
        return;
      }

      successMsg.textContent = data.message;
      successMsg.style.display = "block";
      setTimeout(() => (window.location.href = "../index.html"), 3000);
    } catch (err) {
      errorMsg.textContent = "Connection failed. Is the server running?";
      errorMsg.style.display = "block";
    }
  });
}
