// backend/models/customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {type: String, required: true},
    phone: {type: String},
    address: {type: String},
    city: {type: String},
    code: {type: String}, // customer code / id
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},  // Link to the user
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Customer', customerSchema);
