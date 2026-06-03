const API = "http://localhost:5000/api";

// ── Login Form ────────────────────────────────────────────
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("error-msg");

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.error;
        errorMsg.style.display = "block";
        return;
      }

      localStorage.setItem("kidvax_token", data.token);
      localStorage.setItem("kidvax_user", JSON.stringify(data.user));
      window.location.href = "pages/dashboard.html";
    } catch (err) {
      errorMsg.textContent = "Connection failed. Is the server running?";
      errorMsg.style.display = "block";
    }
  });
}

// ── Register Form ─────────────────────────────────────────
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullname = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("error-msg");
    const successMsg = document.getElementById("success-msg");

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.error;
        errorMsg.style.display = "block";
        return;
      }

      successMsg.textContent = "Account created! Redirecting to login...";
      successMsg.style.display = "block";
      setTimeout(() => (window.location.href = "../index.html"), 2000);
    } catch (err) {
      errorMsg.textContent = "Connection failed. Is the server running?";
      errorMsg.style.display = "block";
    }
  });
}
