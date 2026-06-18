const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  sendReminder,
  deleteNotification,
} = require("../controllers/notificationController");

router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markAsRead);
router.post("/send-reminder", protect, sendReminder);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
