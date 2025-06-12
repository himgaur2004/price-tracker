const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://ishagauravsingh:Tt85U4rsCKjb7p1A@buy.tms55zj.mongodb.net/buy-more';

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });
        console.log('Successfully connected to MongoDB!');
        await mongoose.connection.close();
        console.log('Connection closed.');
    } catch (error) {
        console.error('Connection error:', error);
    }
}

testConnection(); 