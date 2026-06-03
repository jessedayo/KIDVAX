// Handles all database queries related to vaccines
const pool = require('../config/db');

const getAllVaccines = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM vaccines ORDER BY recommended_days ASC'
  );
  return rows;
};

const getVaccineRecords = async (childId) => {
  const [rows] = await pool.query(
    `SELECT vr.*, v.vaccine_name, v.recommended_age, v.recommended_days, v.description,
      DATE_ADD(c.date_of_birth, INTERVAL v.recommended_days DAY) AS due_date
     FROM vaccine_records vr
     JOIN vaccines v ON vr.vaccine_id = v.vaccine_id
     JOIN children c ON vr.child_id = c.child_id
     WHERE vr.child_id = ?
     ORDER BY v.recommended_days ASC`,
    [childId]
  );
  return rows;
};

const setupVaccineRecords = async (childId) => {
  const vaccines = await getAllVaccines();
  for (const vaccine of vaccines) {
    await pool.query(
      `INSERT IGNORE INTO vaccine_records (child_id, vaccine_id, status)
       VALUES (?, ?, 'pending')`,
      [childId, vaccine.vaccine_id]
    );
  }
};

const updateVaccineStatus = async (recordId, status, vaccinationDate) => {
  await pool.query(
    `UPDATE vaccine_records SET status = ?, vaccination_date = ? WHERE record_id = ?`,
    [status, vaccinationDate, recordId]
  );
};

const updateNotifiedFlags = async (recordId, type) => {
  const column =
    type === 'upcoming' ? 'notified_upcoming' :
    type === 'due'      ? 'notified_due'      : 'notified_overdue';
  await pool.query(
    `UPDATE vaccine_records SET ${column} = 1 WHERE record_id = ?`,
    [recordId]
  );
};

const getAllPendingVaccines = async () => {
  const [rows] = await pool.query(
    `SELECT vr.record_id, vr.status,
      vr.notified_upcoming, vr.notified_due, vr.notified_overdue,
      c.child_id, c.child_name, c.date_of_birth,
      u.user_id, u.email, u.fullname,
      v.vaccine_name, v.recommended_days,
      DATE_ADD(c.date_of_birth, INTERVAL v.recommended_days DAY) AS due_date
     FROM vaccine_records vr
     JOIN children  c ON vr.child_id   = c.child_id
     JOIN users     u ON c.user_id     = u.user_id
     JOIN vaccines  v ON vr.vaccine_id = v.vaccine_id
     WHERE vr.status != 'completed'
     ORDER BY due_date ASC`
  );
  return rows;
};

module.exports = {
  getAllVaccines,
  getVaccineRecords,
  setupVaccineRecords,
  updateVaccineStatus,
  updateNotifiedFlags,
  getAllPendingVaccines
};