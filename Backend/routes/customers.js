// backend/routes/customers.js
const express = require('express');
const router = express.Router();
const {getCustomers, createCustomer, getzones, getprovinces} = require('../controllers/customerController');
const {protect} = require('../middleware/Auth');

router.get('/', protect, getCustomers);
router.post('/', protect, createCustomer); // add this to allow frontend to create customer
router.get('/zones', protect, getzones);
router.get('/provinces', protect, getprovinces);


module.exports = router;
