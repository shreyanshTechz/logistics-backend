const express = require('express');
const Driver = require('../models/Driver'); // Assuming you have a Driver model
const router = express.Router();

// Fetch all available drivers
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find({ isAvailable: true }); // Fetch available drivers
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching drivers' });
  }
});

module.exports = router;