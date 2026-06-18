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

// Load notifications
async function loadNotifications() {
  try {
    const res = await fetch(`${API}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const notifications = await res.json();
    renderNotifications(notifications);
  } catch (err) {
    console.error("Failed to load notifications:", err);
  }
}

// Render notifications
function renderNotifications(notifications) {
  const list = document.getElementById("notifications-list");

  if (notifications.length === 0) {
    list.innerHTML = `<p class="text-muted">No notifications yet. They will appear here when reminders are sent.</p>`;
    return;
  }

  list.innerHTML = notifications
    .map(
      (notif) => `
    <div style="
      padding:        12px 16px;
      border-radius:  8px;
      margin-bottom:  8px;
      background:     ${notif.status === "read" ? "#f9f9f9" : "var(--primary-bg)"};
      border:         1px solid ${notif.status === "read" ? "var(--border)" : "#c8e6c9"};
      display:        flex;
      justify-content: space-between;
      align-items:    center;
      gap:            16px;
    ">
      <div>
        <p style="font-size:14px; font-weight:${notif.status === "read" ? 400 : 600};">
          ${notif.message}
        </p>
        <p class="text-muted" style="font-size:12px; margin-top:4px;">
          ${new Date(notif.date_sent).toLocaleString()}
        </p>
      </div>
     <div style="display: flex; gap: 8px; align-items: center;">
        ${
          notif.status === "sent"
            ? `<button class="btn btn-secondary btn-sm" onclick="markRead(${notif.notification_id})">Mark Read</button>`
            : '<span class="text-muted" style="font-size:12px;">Read</span>'
        }
        <button class="btn btn-danger btn-sm" onclick="deleteNotif(${notif.notification_id})">🗑️</button>
      </div>
    </div>
  `,
    )
    .join("");
}

// Mark notification as read
async function markRead(id) {
  try {
    await fetch(`${API}/notifications/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadNotifications();
  } catch (err) {
    console.error("Failed to mark as read:", err);
  }
}
// Delete a notification
async function deleteNotif(id) {
  if (!confirm("Delete this notification?")) return;
  try {
    await fetch(`${API}/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadNotifications();
  } catch (err) {
    console.error("Failed to delete notification:", err);
  }
}

loadNotifications();
