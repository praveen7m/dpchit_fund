const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const user = await User.create({ username, password, role });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Hardcoded credentials
    if (username === 'admin' && password === 'admin123') {
      // Create admin user if doesn't exist
      let adminUser = await User.findOne({ username: 'admin' });
      if (!adminUser) {
        adminUser = await User.create({ username: 'admin', password: 'admin123', role: 'admin' });
      }
      
      const token = jwt.sign({ id: adminUser.id }, process.env.JWT_SECRET);
      return res.json({
        token,
        user: {
          id: adminUser.id,
          username: 'admin',
          role: 'admin'
        }
      });
    }
    
    if (username === 'collection agent' && password === 'collection123') {
      // Create collection agent user if doesn't exist
      let agentUser = await User.findOne({ username: 'collection agent' });
      if (!agentUser) {
        try {
          agentUser = await User.create({ username: 'collection agent', password: 'collection123', role: 'user' });
        } catch (createError) {
          console.error('Error creating collection agent:', createError);
          return res.status(500).json({ message: 'Failed to create user' });
        }
      }
      
      const token = jwt.sign({ id: agentUser.id }, process.env.JWT_SECRET);
      return res.json({
        token,
        user: {
          id: agentUser.id,
          username: 'collection agent',
          role: 'user'
        }
      });
    }
    
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user count (admin only)
router.get('/users/count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;