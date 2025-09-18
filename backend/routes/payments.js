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

    const payments = await Payment.find(query).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's payments
router.get('/my-payments', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
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
      userId: req.user._id
    };
    
    const payment = new Payment(paymentData);
    await payment.save();
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
    if (req.user.role !== 'admin' && payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stats (admin only)
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const totalAmount = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
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