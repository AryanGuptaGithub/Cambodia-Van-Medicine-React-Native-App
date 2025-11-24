const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {type: String, required: true},
    phone: {type: String},
    address: {type: String},
    city: {type: String},
    code: {type: String}, // customer code / id
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Customer', customerSchema);
