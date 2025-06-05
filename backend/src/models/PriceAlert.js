const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    minPrice: {
        type: Number,
        required: true,
    },
    maxPrice: {
        type: Number,
        required: true,
    },
    notificationType: {
        type: String,
        enum: ['email', 'sms', 'both'],
        default: 'email',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastNotified: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('PriceAlert', priceAlertSchema); 