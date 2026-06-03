// Handles all database queries related to children
const pool = require("../config/db");

const getChildrenByUser = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM children WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
  );
  return rows;
};

const createChild = async (userId, childName, dateOfBirth, gender) => {
  const [result] = await pool.query(
    "INSERT INTO children (user_id, child_name, date_of_birth, gender) VALUES (?, ?, ?, ?)",
    [userId, childName, dateOfBirth, gender],
  );
  return result.insertId;
};

const updateChild = async (childId, childName, dateOfBirth, gender) => {
  await pool.query(
    "UPDATE children SET child_name = ?, date_of_birth = ?, gender = ? WHERE child_id = ?",
    [childName, dateOfBirth, gender, childId],
  );
};

const deleteChild = async (childId) => {
  await pool.query("DELETE FROM children WHERE child_id = ?", [childId]);
};

module.exports = { getChildrenByUser, createChild, updateChild, deleteChild };
