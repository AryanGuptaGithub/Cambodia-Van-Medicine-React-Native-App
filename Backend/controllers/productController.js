const Product = require('../models/Product');

// Example for your list function:
exports.list = async (req, res) => {
    try {
        const products = await Product.find().lean();  // fetch all products
        res.json(products); // just the array
    } catch (error) {
        res.status(500).json({message: error.message || 'Server Error'});
    }
};


exports.get = async (req, res) => {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({message: 'Not found'});
    res.json(p);
};

exports.create = async (req, res) => {
    const doc = new Product(req.body);
    await doc.save();
    res.status(201).json(doc);
};

exports.update = async (req, res) => {
    const doc = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if (!doc) return res.status(404).json({message: 'Not found'});
    res.json(doc);
};

exports.remove = async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({message: 'Deleted'});
};
