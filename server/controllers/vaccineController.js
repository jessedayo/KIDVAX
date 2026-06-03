// Handles all logic for vaccine tracking
const {
  getAllVaccines,
  getVaccineRecords,
  updateVaccineStatus,
} = require("../models/vaccineModel");

const fetchAllVaccines = async (req, res) => {
  try {
    const vaccines = await getAllVaccines();
    res.json(vaccines);
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

const fetchVaccineRecords = async (req, res) => {
  try {
    const records = await getVaccineRecords(req.params.childId);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

const updateRecord = async (req, res) => {
  try {
    const { status, vaccination_date } = req.body;
    await updateVaccineStatus(
      req.params.recordId,
      status,
      vaccination_date || null,
    );
    res.json({ message: "✅ Vaccine record updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

module.exports = { fetchAllVaccines, fetchVaccineRecords, updateRecord };
