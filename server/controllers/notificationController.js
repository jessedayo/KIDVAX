// Handles all logic for notifications and email reminders
const {
  createNotification,
  getNotificationsByUser,
  markNotificationRead,
} = require("../models/notificationModel");
const { sendVaccineReminder } = require("../services/emailService");
const pool = require("../config/db");

const getNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsByUser(req.user.user_id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    await markNotificationRead(req.params.id);
    res.json({ message: "✅ Notification marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};
const deleteNotification = async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM notifications WHERE notification_id = ? AND user_id = ?",
      [req.params.id, req.user.user_id],
    );
    res.json({ message: "✅ Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};
const sendReminder = async (req, res) => {
  try {
    const { childId } = req.body;

    const [children] = await pool.query(
      "SELECT * FROM children WHERE child_id = ? AND user_id = ?",
      [childId, req.user.user_id],
    );
    if (children.length === 0) {
      return res.status(404).json({ error: "Child not found" });
    }
    const child = children[0];

    const [users] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
      req.user.user_id,
    ]);
    const user = users[0];

    const [records] = await pool.query(
      `SELECT vr.*, v.vaccine_name, v.recommended_days
       FROM vaccine_records vr
       JOIN vaccines v ON vr.vaccine_id = v.vaccine_id
       WHERE vr.child_id = ? AND vr.status = 'pending'`,
      [childId],
    );

    if (records.length === 0) {
      return res.status(400).json({ error: "No pending vaccines found" });
    }

    const vaccines = records.map((r) => ({
      vaccine_name: r.vaccine_name,
      due_date: new Date(
        new Date(child.date_of_birth).getTime() + r.recommended_days * 86400000,
      ).toLocaleDateString(),
      type: "upcoming",
      daysUntil: Math.ceil(
        (new Date(child.date_of_birth).getTime() +
          r.recommended_days * 86400000 -
          Date.now()) /
          86400000,
      ),
    }));

    await sendVaccineReminder(
      user.email,
      user.fullname,
      child.child_name,
      vaccines,
    );
    await createNotification(
      req.user.user_id,
      `Reminder sent for ${child.child_name}: ${records.length} pending vaccines`,
    );

    res.json({ message: "✅ Reminder email sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  sendReminder,
  deleteNotification,
};
