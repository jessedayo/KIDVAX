// Handles all database queries related to users
const pool = require("../config/db");

// Find a user by their email
const findUserByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows[0];
};

// Create a new user
const createUser = async (fullname, email, hashedPassword) => {
  const [result] = await pool.query(
    "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)",
    [fullname, email, hashedPassword],
  );
  return result.insertId;
};

// Find a user by their ID
const findUserById = async (id) => {
  const [rows] = await pool.query(
    "SELECT user_id, fullname, email FROM users WHERE user_id = ?",
    [id],
  );
  return rows[0];
};

module.exports = { findUserByEmail, createUser, findUserById };
