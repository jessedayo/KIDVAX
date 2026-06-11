// User settings routes
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  updateName,
  updatePassword,
  deleteAccount,
} = require("../controllers/userController");

router.put("/update-name", protect, updateName);
router.put("/update-password", protect, updatePassword);
router.delete("/delete", protect, deleteAccount);

module.exports = router;
