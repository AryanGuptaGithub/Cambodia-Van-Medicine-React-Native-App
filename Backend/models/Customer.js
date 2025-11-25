const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {type: String, required: true},

    customerCode: {type: String, unique: true, required: true},  // 🔥 REQUIRED FIELD
    typeOfBusiness: {type: String, default: 'Pharmacy'},

    email: {type: String, default: ''},
    phone: {type: String, default: ''},

    medicalRepName: {type: String, default: ''},  // 🔥 needed for frontend
    medicalRepId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},

    zone: {type: String, default: ''},
    province: {type: String, default: ''},
    address: {type: String, default: ''},

    remark: {type: String, default: ''},
    date: {type: Date, default: Date.now},

    customerNumber: {type: String, default: ''},

    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
}, {timestamps: true});

module.exports = mongoose.model('Customer', customerSchema);
