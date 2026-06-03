const express     = require('express');
const router      = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { fetchAllVaccines, fetchVaccineRecords, updateRecord } = require('../controllers/vaccineController');

router.get('/schedule',          protect, fetchAllVaccines);
router.get('/records/:childId',  protect, fetchVaccineRecords);
router.put('/records/:recordId', protect, updateRecord);

module.exports = router;