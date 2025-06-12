const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Price Tracker API is running',
        version: '1.0.0',
        mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Database connection with retry logic
const connectDB = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            const mongoURI = process.env.MONGODB_URI;
            if (!mongoURI) {
                throw new Error('MONGODB_URI environment variable is not set');
            }
            console.log('Attempting to connect to MongoDB...');
            await mongoose.connect(mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            });
            console.log('Connected to MongoDB successfully');
            return;
        } catch (err) {
            console.error(`MongoDB connection attempt ${i + 1} failed:`, err.message);
            if (i === retries - 1) throw err;
            // Wait for 5 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

// Connect to MongoDB
connectDB().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    // Don't exit the process, let the API run without DB connection
    // process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/alerts', require('./routes/alerts'));

// Initialize price checker service
require('./services/priceChecker');

const PORT = process.env.PORT || 5050;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
}); 