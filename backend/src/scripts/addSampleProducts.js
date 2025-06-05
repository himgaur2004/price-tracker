const mongoose = require('mongoose');
const Product = require('../models/Product');

mongoose.connect('mongodb://localhost:27017/buy-more')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

const sampleProducts = [
    {
        name: 'iPhone 15 Pro Max',
        url: 'https://www.amazon.in/iPhone-15-Pro-Max',
        currentPrice: 149900,
        website: 'amazon',
        imageUrl: 'https://example.com/iphone15.jpg',
        productIdentifier: 'IPHONE15PROMAX',
        category: 'Smartphones',
        brand: 'Apple',
        lowestPrice: 149900,
        highestPrice: 159900,
        createdBy: '65c4e3f2e84f1c2d3a4b5c6d', // Sample user ID
        historicalPrices: [{ price: 149900 }]
    },
    {
        name: 'Samsung Galaxy S24 Ultra',
        url: 'https://www.flipkart.com/samsung-s24-ultra',
        currentPrice: 129999,
        website: 'flipkart',
        imageUrl: 'https://example.com/s24.jpg',
        productIdentifier: 'SAMSUNGS24ULTRA',
        category: 'Smartphones',
        brand: 'Samsung',
        lowestPrice: 129999,
        highestPrice: 139999,
        createdBy: '65c4e3f2e84f1c2d3a4b5c6d', // Sample user ID
        historicalPrices: [{ price: 129999 }]
    },
    {
        name: 'Sony WH-1000XM5',
        url: 'https://www.amazon.in/sony-wh1000xm5',
        currentPrice: 29990,
        website: 'amazon',
        imageUrl: 'https://example.com/wh1000xm5.jpg',
        productIdentifier: 'SONYWH1000XM5',
        category: 'Headphones',
        brand: 'Sony',
        lowestPrice: 29990,
        highestPrice: 34990,
        createdBy: '65c4e3f2e84f1c2d3a4b5c6d', // Sample user ID
        historicalPrices: [{ price: 29990 }]
    }
];

async function addSampleProducts() {
    try {
        await Product.deleteMany({}); // Clear existing products
        await Product.insertMany(sampleProducts);
        console.log('Sample products added successfully');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error adding sample products:', error);
        mongoose.connection.close();
    }
}

addSampleProducts(); 