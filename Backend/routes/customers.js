// backend/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const {getCustomers} = require('../controllers/customerController');
const {protect} = require('../middleware/authMiddleware');  // To protect the route with authentication

// Route to get customers for the logged-in user
router.get('/', protect, getCustomers);

module.exports = router;