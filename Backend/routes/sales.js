const express = require('express');
const router = express.Router();
const Sale = require('../models/Sales'); // Make sure you create this model

// Create a new sale
router.post('/', async (req, res) => {
    try {
        const saleData = req.body;
        console.log('Sending sale to backend:', saleData);

        // You can add validation here if needed

        const sale = new Sale(saleData);
        await sale.save();

        res.status(201).json({ok: true, sale});
    } catch (err) {
        console.error(err);
        res.status(500).json({ok: false, error: 'Failed to create sale'});
    }
});

// Optional: Get all sales
router.get('/', async (req, res) => {
    try {
        const sales = await Sale.find().sort({createdAt: -1});
        res.json({ok: true, sales});
    } catch (err) {
        console.error(err);
        res.status(500).json({ok: false, error: 'Failed to fetch sales'});
    }
});

module.exports = router;
