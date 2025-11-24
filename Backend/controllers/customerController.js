// backend/controllers/customerController.js
const Customer = require('../models/Customer');

// Get customers for the logged-in user
exports.getCustomers = async (req, res) => {
    try {
        // Get the user id from the JWT token
        const userId = req.user.id;

        // Find all customers related to the logged-in user
        const customers = await Customer.find({medRep: userId});

        res.json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

// Create a new customer (and associate it with the logged-in user)
exports.createCustomer = async (req, res) => {
    const {name, phone, address, city, code} = req.body;
    try {
        // Get the logged-in user's ID from the JWT token
        const userId = req.user.id;

        const newCustomer = new Customer({
            name,
            phone,
            address,
            city,
            code,
            user: userId, // associate the customer with the logged-in user
        });

        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};
