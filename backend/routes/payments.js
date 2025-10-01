const express = require('express');
const Payment = require('../models/Payment');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all payments (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { search, frequency, dateFrom, dateTo } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { invoiceNo: { $regex: search, $options: 'i' } }
      ];
    }

    if (frequency && frequency !== 'all') {
      query.frequency = frequency;
    }

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const payments = await Payment.find(query);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's payments
router.get('/my-payments', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create payment
router.post('/', auth, async (req, res) => {
  try {
    const paymentData = {
      ...req.body,
      userId: req.user.id
    };
    
    const payment = await Payment.create(paymentData);
    
    // Emit event for real-time updates
    if (global.io) {
      global.io.emit('paymentCreated', payment);
    }
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete payment
router.delete('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Users can only delete their own payments, admins can delete any
    if (req.user.role !== 'admin' && payment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Payment.findByIdAndDelete(req.params.id);
    
    // Emit event for real-time updates
    if (global.io) {
      global.io.emit('paymentDeleted', { id: req.params.id });
    }
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save user info (not payment)
router.post('/user-info', auth, async (req, res) => {
  try {
    const { name, phone, location, amount, frequency } = req.body;
    const { db } = require('../config/database');
    
    const [result] = await db.execute(
      'INSERT INTO user_info (name, phone, location, amount, frequency, created_by) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), location=VALUES(location), amount=VALUES(amount), frequency=VALUES(frequency)',
      [name, phone, location, amount, frequency, req.user.id]
    );
    
    res.status(201).json({ message: 'User info saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search user by phone number (for collection agent)
router.get('/search-user', auth, async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const { db } = require('../config/database');
    const [rows] = await db.execute('SELECT * FROM user_info WHERE phone = ? ORDER BY updated_at DESC LIMIT 1', [phone]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin search user with payment history
router.get('/admin-search-user', auth, adminAuth, async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const { db } = require('../config/database');
    
    // Get user info
    const [userRows] = await db.execute('SELECT * FROM user_info WHERE phone = ? ORDER BY updated_at DESC LIMIT 1', [phone]);
    
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get payment history
    const [paymentRows] = await db.execute(
      'SELECT id, invoice_no as invoiceNo, name, phone, location, amount, frequency, date, status, created_at as createdAt FROM payments WHERE phone = ? ORDER BY created_at DESC',
      [phone]
    );

    res.json({
      userInfo: userRows[0],
      paymentHistory: paymentRows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stats (admin only)
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const totalAmount = await Payment.aggregate();
    
    const monthlyPayments = await Payment.countDocuments({
      date: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    res.json({
      totalPayments,
      totalAmount: totalAmount[0]?.total || 0,
      monthlyPayments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;