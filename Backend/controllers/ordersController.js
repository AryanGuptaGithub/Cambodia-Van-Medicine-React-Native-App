const Order = require('../models/Order');
const Product = require('../models/Product');

exports.create = async (req, res) => {
    const {customer, items} = req.body;
    if (!items || !items.length) return res.status(400).json({message: 'Order must have items'});

    let total = 0;
    for (const it of items) {
        const prod = await Product.findById(it.product);
        if (!prod) return res.status(400).json({message: `Product not found: ${it.product}`});
        total += (it.qty * (it.price ?? prod.price));
        // optionally reduce stock here
    }

    const order = new Order({
        customer,
        items,
        total,
        createdBy: req.user ? req.user._id : undefined
    });

    await order.save();
    res.status(201).json(order);
};

exports.list = async (req, res) => {
    const {page = 1, limit = 50} = req.query;
    const items = await Order.find()
        .populate('customer')
        .populate('items.product')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();
    const total = await Order.countDocuments();
    res.json({items, total, page: Number(page)});
};
