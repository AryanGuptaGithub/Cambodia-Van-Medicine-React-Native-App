const Product = require('../models/product');

// Add stock
exports.addStock = async (req, res) => {
    const {productId, quantity, note} = req.body;
    if (!productId || !quantity) return res.status(400).json({error: 'productId and quantity required'});

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({error: 'Product not found'});

    product.stock = (product.stock || 0) + Number(quantity);
    await product.save();

    res.json({ok: true, product, note: note || ''});
};

// Remove stock
exports.removeStock = async (req, res) => {
    const {productId, quantity, note} = req.body;
    if (!productId || !quantity) return res.status(400).json({error: 'productId and quantity required'});

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({error: 'Product not found'});

    product.stock = Math.max(0, (product.stock || 0) - Number(quantity));
    await product.save();

    res.json({ok: true, product, note: note || ''});
};

// Fetch all stocks
exports.listStocks = async (req, res) => {
    const products = await Product.find({}, 'name stock price sku'); // Return only needed fields
    res.json(products);
};
