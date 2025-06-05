const express = require('express');
const auth = require('../middleware/auth');
const PriceAlert = require('../models/PriceAlert');

const router = express.Router();

// Get all alerts for a user
router.get('/', auth, async (req, res) => {
    try {
        const alerts = await PriceAlert.find({ user: req.user.userId })
            .populate('product');
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching alerts', error: error.message });
    }
});

// Create a new alert
router.post('/', auth, async (req, res) => {
    try {
        const { productId, minPrice, maxPrice, notificationType } = req.body;

        const alert = new PriceAlert({
            user: req.user.userId,
            product: productId,
            minPrice,
            maxPrice,
            notificationType,
        });

        await alert.save();
        await alert.populate('product');
        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ message: 'Error creating alert', error: error.message });
    }
});

// Update an alert
router.patch('/:id', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['minPrice', 'maxPrice', 'notificationType', 'isActive'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        const alert = await PriceAlert.findOne({
            _id: req.params.id,
            user: req.user.userId,
        });

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        updates.forEach(update => alert[update] = req.body[update]);
        await alert.save();
        await alert.populate('product');
        res.json(alert);
    } catch (error) {
        res.status(500).json({ message: 'Error updating alert', error: error.message });
    }
});

// Delete an alert
router.delete('/:id', auth, async (req, res) => {
    try {
        const alert = await PriceAlert.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId,
        });

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting alert', error: error.message });
    }
});

module.exports = router; 