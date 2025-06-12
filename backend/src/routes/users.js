const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({
            email,
            password
        });

        // Save user to database
        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get user settings
router.get('/settings', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({ message: 'Error fetching user settings' });
    }
});

// Update user settings
router.patch('/settings', auth, async (req, res) => {
    try {
        const { email, phone, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update email if provided
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }

        // Update phone if provided
        if (phone !== undefined) {
            user.phone = phone;
        }

        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required' });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            user.password = newPassword;
        }

        await user.save();

        // Return user data without password
        const userData = user.toObject();
        delete userData.password;

        res.json(userData);
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({ message: 'Error updating user settings' });
    }
});

module.exports = router; 