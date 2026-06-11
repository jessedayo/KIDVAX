// Handles user profile/settings updates
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../config/db");
const { sendVaccineReminder } = require("../services/emailService");

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

    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
      req.user.user_id,
    ]);
    const user = rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

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

// Forgot password — send reset email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ error: "No account found with that email" });
    }

    const user = rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?",
      [token, expires, user.user_id],
    );

    // Send reset email
    const resetLink = `http://127.0.0.1:5500/pages/reset-password.html?token=${token}`;

    await sendVaccineReminder(user.email, user.fullname, "", [
      {
        vaccine_name: "",
        due_date: "",
        type: "reset",
        resetLink,
      },
    ]);

    res.json({ message: "✅ Reset link sent to your email!" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// Reset password using token
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
      [token],
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

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

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?",
      [hashed, rows[0].user_id],
    );

    res.json({ message: "✅ Password reset successfully! You can now login." });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

module.exports = {
  updateName,
  updatePassword,
  deleteAccount,
  forgotPassword,
  resetPassword,
};
