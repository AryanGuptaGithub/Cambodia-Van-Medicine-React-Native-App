const express = require('express');
const router = express.Router();
const {getZones, getProvinces} = require('../controllers/miscController');
const {protect} = require('../middleware/Auth');

router.get('/zones', protect, getZones);
router.get('/provinces', protect, getProvinces);

module.exports = router;
