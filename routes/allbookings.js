const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');

const router = express.Router();

// Get all pending bookings with user details
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' }).populate('userId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

module.exports = router;