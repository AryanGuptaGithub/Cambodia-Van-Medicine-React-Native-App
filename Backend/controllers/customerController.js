// backend/controllers/customerController.js
const Customer = require('../models/Customer');

// Get customers for the logged-in user
exports.getCustomers = async (req, res) => {
    try {
        // Get the user id from the JWT token
        const userId = req.user.id;

        // Find all customers related to the logged-in user
        const customers = await Customer.find({user: userId}).sort({createdAt: -1});

        res.json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

// Create a new customer (and associate it with the logged-in user)
exports.createCustomer = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find max existing customerCode
        const lastCustomer = await Customer.findOne().sort({customerCode: -1});

        let nextCode = "0001";

        if (lastCustomer && lastCustomer.customerCode) {
            nextCode = String(Number(lastCustomer.customerCode) + 1).padStart(4, "0");
        }


        const newCustomer = new Customer({
            name: req.body.name,
            customerCode: nextCode,
            typeOfBusiness: req.body.typeOfBusiness,
            email: req.body.email,
            phone: req.body.phone,

            medicalRepName: req.body.medicalRepName,
            medicalRepId: userId,

            zone: req.body.zone,
            province: req.body.province,
            address: req.body.address,
            remark: req.body.remark,

            date: req.body.date || new Date(),
            customerNumber: req.body.customerNumber || '',

            user: userId
        });

        await newCustomer.save();
        res.status(201).json(newCustomer);

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error', error: error.message});
    }
};


exports.getzones = async (req, res) => {
    try {
        const zones = await Customer.distinct('zone');
        res.json(zones);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
}


exports.getprovinces = async (req, res) => {
    try {
        const provinces = await Customer.distinct('province');
        res.json(provinces);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }

}
