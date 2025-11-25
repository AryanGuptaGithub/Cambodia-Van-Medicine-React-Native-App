const mongoose = require('mongoose');

module.exports = async function connectDB() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('MONGODB_URI not set in .env');
    }

    try {
        // Connecting to MongoDB
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // You can also consider enabling other options based on your needs
            // For example, `useFindAndModify: false` if you're working with deprecated Mongo methods
        });

        console.log('MongoDB connected');
    } catch (error) {
        // If connection fails, log the error and throw it
        console.error('Failed to connect to MongoDB:', error.message);
        process.exit(1); // Exit the process if MongoDB connection fails
    }
};
