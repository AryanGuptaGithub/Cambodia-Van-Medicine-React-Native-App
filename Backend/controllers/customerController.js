const Customer = require('../models/Customer');

exports.list = async (req, res) => {
    const {page = 1, limit = 50, q} = req.query;
    const filter = q ? {name: new RegExp(q, 'i')} : {};
    const items = await Customer.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();
    const total = await Customer.countDocuments(filter);
    res.json({items, total, page: Number(page)});
};

exports.create = async (req, res) => {
    const doc = new Customer(req.body);
    await doc.save();
    res.status(201).json(doc);
};

// get, update, delete similar to products
