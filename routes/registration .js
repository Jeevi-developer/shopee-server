app.post('/api/sellers/register', async (req, res) => {
  try {
    const { name, email, password, businessName, phone, address, businessType } = req.body;

    // Validation
    if (!name || !email || !password || !businessName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email: email.toLowerCase() });
    if (existingSeller) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new seller
    const newSeller = new Seller({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      businessName,
      phone,
      address: address || '',
      businessType: businessType || 'Retail',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newSeller.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        sellerId: newSeller._id.toString(), 
        email: newSeller.email 
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    // Return success response with seller data and token
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: token,
      seller: {
        id: newSeller._id,
        name: newSeller.name,
        email: newSeller.email,
        businessName: newSeller.businessName,
        phone: newSeller.phone,
        address: newSeller.address,
        businessType: newSeller.businessType,
        profileImage: newSeller.profileImage,
        isVerified: newSeller.isVerified,
        totalProducts: newSeller.totalProducts,
        totalSales: newSeller.totalSales,
        revenue: newSeller.revenue,
        rating: newSeller.rating,
        createdAt: newSeller.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
});

// GET SELLER PROFILE
app.get('/api/sellers/profile', authenticateToken, async (req, res) => {
  try {
    const sellerId = req.user.sellerId;

    const seller = await Seller.findById(sellerId).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.json({
      success: true,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        businessName: seller.businessName,
        phone: seller.phone,
        address: seller.address,
        businessType: seller.businessType,
        profileImage: seller.profileImage,
        isVerified: seller.isVerified,
        totalProducts: seller.totalProducts,
        totalSales: seller.totalSales,
        revenue: seller.revenue,
        rating: seller.rating,
        createdAt: seller.createdAt,
        updatedAt: seller.updatedAt
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// UPDATE SELLER PROFILE
app.put('/api/sellers/profile', authenticateToken, async (req, res) => {
  try {
    const sellerId = req.user.sellerId;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email;
    delete updates._id;

    updates.updatedAt = new Date();

    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      seller: seller
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// LOGIN ENDPOINT
app.post('/api/sellers/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const seller = await Seller.findOne({ email: email.toLowerCase() });

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, seller.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { 
        sellerId: seller._id.toString(), 
        email: seller.email 
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        businessName: seller.businessName,
        phone: seller.phone,
        address: seller.address,
        businessType: seller.businessType,
        profileImage: seller.profileImage,
        isVerified: seller.isVerified,
        totalProducts: seller.totalProducts,
        totalSales: seller.totalSales,
        revenue: seller.revenue,
        rating: seller.rating,
        createdAt: seller.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});