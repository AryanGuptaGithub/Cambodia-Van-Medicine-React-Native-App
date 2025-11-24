// Backend/controllers/authController
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
    return jwt.sign({
        id: user._id,
        role: user.role
    }, process.env.JWT_SECRET, {expiresIn: process.env.TOKEN_EXPIRES_IN || '7d'});
}

exports.register = async (req, res) => {
    const {name, email, password} = req.body;
    console.log('Registering user:', req.body); // This will log the incoming registration data

    const existing = await User.findOne({email});
    if (existing) return res.status(400).json({message: 'Email already registered'});
    const user = new User({name, email, password});
    await user.save();
    const token = signToken(user);
    res.status(201).json({token, user: {id: user._id, name: user.name, email: user.email, role: user.role}});
};

exports.login = async (req, res) => {
    const {email, password} = req.body;
    console.log('Logging user:', req.body);
    const user = await User.findOne({email});
    if (!user) {
        console.log("Email was not found");
        return res.status(400).json({message: 'Invalid credentials'})
    }
    ;
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        console.log("Password didn't matched");
        return res.status(400).json({message: 'Invalid credentials'})
    }
    ;
    const token = signToken(user);
    res.json({token, user: {id: user._id, name: user.name, email: user.email, role: user.role}});
};
