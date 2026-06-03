// Handles all database queries related to notifications
const pool = require("../config/db");

const createNotification = async (userId, message) => {
  const [result] = await pool.query(
    'INSERT INTO notifications (user_id, message, status) VALUES (?, ?, "sent")',
    [userId, message],
  );
  return result.insertId;
};

const getNotificationsByUser = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY date_sent DESC",
    [userId],
  );
  return rows;
};

const markNotificationRead = async (notificationId) => {
  await pool.query(
    'UPDATE notifications SET status = "read" WHERE notification_id = ?',
    [notificationId],
  );
};

module.exports = {
  createNotification,
  getNotificationsByUser,
  markNotificationRead,
};
