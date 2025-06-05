const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    url: {
        type: String,
        required: true,
        trim: true,
    },
    currentPrice: {
        type: Number,
        required: true,
    },
    historicalPrices: [{
        price: Number,
        date: {
            type: Date,
            default: Date.now,
        },
    }],
    website: {
        type: String,
        required: true,
        enum: ['amazon', 'flipkart', 'reliance', 'croma', 'bazaar', 'other'],
    },
    imageUrl: String,
    affiliateUrl: String,
    lastChecked: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productIdentifier: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        trim: true,
    },
    brand: {
        type: String,
        trim: true,
    },
    lowestPrice: {
        type: Number,
        required: true,
    },
    highestPrice: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

// Index for search functionality
productSchema.index({
    name: 'text',
    brand: 'text',
    category: 'text',
    productIdentifier: 'text'
});

module.exports = mongoose.model('Product', productSchema); 