const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

// ==================== Registration Endpoint ====================
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      businessName,
      firmName,
      phone,
      address,
      businessType
    } = req.body;

    // Build name and businessName properly
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    const finalBusinessName = businessName || firmName || 'Unknown Business';

    // Validate required fields
    if (!name || !finalBusinessName) {
      return res.status(400).json({
        success: false,
        message: 'Name and Business Name are required.'
      });
    }

    // Check existing email
    if (await Seller.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new seller
    const newSeller = new Seller({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      businessName: finalBusinessName,
      phone,
      address,
      businessType,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newSeller.save();

    // Generate JWT token
    const token = jwt.sign(
      { sellerId: newSeller._id.toString(), email: newSeller.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    // Success response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      seller: newSeller
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// ==================== Login Endpoint ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email: email.toLowerCase() });
    if (!seller) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!await bcrypt.compare(password, seller.password)) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { sellerId: seller._id.toString(), email: seller.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      seller
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// ==================== Get Seller Profile ====================
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.sellerId).select('-password');
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    res.json({ success: true, seller });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

// ==================== Update Seller Profile ====================
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.email;
    delete updates._id;
    updates.updatedAt = new Date();

    const seller = await Seller.findByIdAndUpdate(req.user.sellerId, updates, { new: true, runValidators: true }).select('-password');
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    res.json({ success: true, message: 'Profile updated successfully', seller });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

module.exports = router;
