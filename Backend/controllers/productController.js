const Product = require('../models/Product');

exports.list = async (req, res) => {
    const {page = 1, limit = 50, q} = req.query;
    const filter = q ? {name: new RegExp(q, 'i')} : {};
    const products = await Product.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();
    const total = await Product.countDocuments(filter);
    res.json({items: products, total, page: Number(page)});
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
