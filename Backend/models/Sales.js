//   Backend/models/Sales.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productName: {type: String, required: true},
    salesQty: {type: Number, required: true},
    bonusQty: {type: Number, default: 0},
    totalQty: {type: Number, required: true},
    sellingPrice: {type: Number, required: true},
    amount: {type: Number, required: true},
    discount: {type: Number, default: 0},
    netSellingAmount: {type: Number, required: true},
    averageUnitPrice: {type: Number},
    lc: {type: Number, default: 0},
    profitLoss: {type: Number, default: 0},
    isProductAccept: {type: Boolean, default: true}
}, {_id: true});

const SaleSchema = new mongoose.Schema({
    recordingDate: {type: Date, default: Date.now},
    invoiceNumber: {type: String, required: true},
    invoiceDate: {type: Date, default: Date.now},
    mrName: {type: String, required: true},
    mrId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    customerName: {type: String, required: true},
    customerId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Customer'},
    products: [ProductSchema],
    creditDays: {type: Number, default: 0},
    dueDate: {type: Date},
    deliveryDate: {type: Date},
    paidAmount: {type: Number, default: 0},
    dueAmount: {type: Number, default: 0},
    totalAmount: {type: Number, required: true},
    paymentStatus: {type: String, enum: ['Cash', 'Credit'], default: 'Cash'},
    remark: {type: String},
}, {timestamps: true});

module.exports = mongoose.model('Sale', SaleSchema);
