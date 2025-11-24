const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true},
    items: [
        {
            product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
            qty: {type: Number, required: true},
            price: {type: Number, required: true}
        }
    ],
    total: {type: Number, required: true},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // the rep who created it
    status: {type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending'},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Order', orderSchema);
