const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendTestEmail } = require('../utils/emailService');
const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        console.log('Registering new user:', { email, name });

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('Registration failed: User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({
            email,
            password,
            name: name || ''
        });

        // Save user to database
        await user.save();
        console.log('User registered successfully:', email);

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Server error during registration',
            error: error.message
        });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for user:', email);

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Login failed: User not found:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.validatePassword(password);
        if (!isMatch) {
            console.log('Login failed: Invalid password for user:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('User logged in successfully:', email);
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Server error during login',
            error: error.message
        });
    }
});

// Get user settings
router.get('/settings', auth, async (req, res) => {
    try {
        console.log('Fetching settings for user:', req.user.userId);

        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            console.log('Settings fetch failed: User not found:', req.user.userId);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Settings fetched successfully for user:', req.user.userId);
        res.json(user);
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({
            message: 'Error fetching user settings',
            error: error.message
        });
    }
});

// Update user settings
router.patch('/settings', auth, async (req, res) => {
    try {
        console.log('Updating settings for user:', req.user.userId);
        const { email, phone, currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            console.log('Settings update failed: User not found:', req.user.userId);
            return res.status(404).json({ message: 'User not found' });
        }

        // Update email if provided
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                console.log('Settings update failed: Email already in use:', email);
                return res.status(400).json({ message: 'Email already in use' });
            }

            // Send test email to new address
            try {
                await sendTestEmail(email);
                user.email = email;
            } catch (emailError) {
                console.error('Failed to send test email:', emailError);
                return res.status(400).json({
                    message: 'Could not verify email address. Please check the email and try again.',
                    error: emailError.message
                });
            }
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

            const isMatch = await user.validatePassword(currentPassword);
            if (!isMatch) {
                console.log('Settings update failed: Invalid current password for user:', req.user.userId);
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            user.password = newPassword;
        }

        await user.save();
        console.log('Settings updated successfully for user:', req.user.userId);

        // Return user data without password
        const userData = user.toObject();
        delete userData.password;

        res.json(userData);
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({
            message: 'Error updating user settings',
            error: error.message
        });
    }
});

module.exports = router; 