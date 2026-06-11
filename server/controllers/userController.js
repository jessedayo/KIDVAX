// Handles user profile/settings updates
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// Update user's full name
const updateName = async (req, res) => {
  try {
    const { fullname } = req.body;
    if (!fullname) {
      return res.status(400).json({ error: "Name is required" });
    }
    await pool.query("UPDATE users SET fullname = ? WHERE user_id = ?", [
      fullname,
      req.user.user_id,
    ]);
    res.json({ message: "✅ Name updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// Update user's password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current user
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
      req.user.user_id,
    ]);
    const user = rows[0];

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res
        .status(400)
        .json({ error: "Password must contain at least one uppercase letter" });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res
        .status(400)
        .json({ error: "Password must contain at least one number" });
    }

    // Hash and save new password
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE user_id = ?", [
      hashed,
      req.user.user_id,
    ]);

    res.json({ message: "✅ Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};
// Delete user account
const deleteAccount = async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE user_id = ?", [req.user.user_id]);
    res.json({ message: "✅ Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

module.exports = { updateName, updatePassword, deleteAccount };
