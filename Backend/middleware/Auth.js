// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // Check if the token is provided in the headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
            // Extract token from the authorization header
            token = req.headers.authorization.split(' ')[1];

            // Decode the token to get the user ID
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the user information to the request
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({message: 'Not authorized'});
        }
    }

    if (!token) {
        res.status(401).json({message: 'Not authorized, no token'});
    }
};