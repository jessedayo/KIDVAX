// User settings routes
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  updateName,
  updatePassword,
  deleteAccount,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

router.put("/update-name", protect, updateName);
router.put("/update-password", protect, updatePassword);
router.delete("/delete", protect, deleteAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
