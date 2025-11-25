const Zone = require('../models/Zone');
const Province = require('../models/Province');

exports.getZones = async (req, res) => {
    try {
        const zones = await Zone.find().sort({name: 1});
        res.json(zones.map(z => z.name));
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
};

exports.getProvinces = async (req, res) => {
    try {
        const provinces = await Province.find().sort({name: 1});
        res.json(provinces.map(p => p.name));
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
};
