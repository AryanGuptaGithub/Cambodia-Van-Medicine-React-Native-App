//  backend/models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {type: String, required: true},
    sku: {type: String},
    price: {type: Number, default: 0},
    stock: {type: Number, default: 0},
    unit: {type: String},
    notes: {type: String},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Product', productSchema);
