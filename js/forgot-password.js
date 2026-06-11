const API = "http://localhost:5000/api";

const forgotForm = document.getElementById("forgot-form");
if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const errorMsg = document.getElementById("error-msg");
    const successMsg = document.getElementById("success-msg");

    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    try {
      const res = await fetch(`${API}/user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.error;
        errorMsg.style.display = "block";
        return;
      }

      successMsg.textContent = data.message;
      successMsg.style.display = "block";
    } catch (err) {
      errorMsg.textContent = "Connection failed. Is the server running?";
      errorMsg.style.display = "block";
    }
  });
}
