const express = require('express');
const authenticateToken = require('../middleware/auth');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');

const router = express.Router();

// Customer Profile
router.get('/customer/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'customer') return res.status(403).json({ message: 'Access denied' });
    const customer = await Customer.findById(req.user.id).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Seller Profile
router.get('/seller/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'seller') return res.status(403).json({ message: 'Access denied' });
    const seller = await Seller.findById(req.user.id).select('-password');
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    res.json({ seller });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Customer Profile
router.put('/customer/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'customer') return res.status(403).json({ message: 'Access denied' });

    const { name, email } = req.body;
    const customer = await Customer.findById(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    if (name) customer.name = name;
    if (email) customer.email = email;
    await customer.save();

    res.json({ message: 'Profile updated successfully', customer: { id: customer._id, name: customer.name, email: customer.email, mobile: customer.mobile } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
