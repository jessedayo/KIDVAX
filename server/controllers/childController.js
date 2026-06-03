// Handles all logic for managing children
const { getChildrenByUser, createChild, updateChild, deleteChild } = require('../models/childModel');
const { setupVaccineRecords } = require('../models/vaccineModel');

const getChildren = async (req, res) => {
  try {
    const children = await getChildrenByUser(req.user.user_id);
    res.json(children);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const addChild = async (req, res) => {
  try {
    const { child_name, date_of_birth, gender } = req.body;
    if (!child_name || !date_of_birth || !gender) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const childId = await createChild(req.user.user_id, child_name, date_of_birth, gender);
    await setupVaccineRecords(childId);
    res.status(201).json({ message: '✅ Child added successfully', childId });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const editChild = async (req, res) => {
  try {
    const { child_name, date_of_birth, gender } = req.body;
    await updateChild(req.params.id, child_name, date_of_birth, gender);
    res.json({ message: '✅ Child updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const removeChild = async (req, res) => {
  try {
    await deleteChild(req.params.id);
    res.json({ message: '✅ Child deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

module.exports = { getChildren, addChild, editChild, removeChild };