const express = require('express');
const Driver = require('../models/Driver'); // Assuming you have a Driver model
const router = express.Router();
const authenticate = require('../middlewares/authenticate'); // Middleware for authentication

// Fetch all available drivers
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find({ isAvailable: true }); // Fetch drivers who are available
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching drivers' });
  }
});

// Update driver location (can be called periodically from the frontend)
router.post('/location', authenticate, async (req, res) => {
  const { lat, lng } = req.body;
  const driverId = req.user.id; // Assuming driver ID is stored in JWT

  try {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Update driver's current location
    driver.currentLocation = { lat, lng };
    await driver.save();

    const io = req.app.get('socketio'); // Get the Socket.io instance
    io.emit('driver-location-changed', { driverId: driver._id, lat, lng });

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating location' });
  }
});

// Update driver's availability
router.post('/availability', authenticate, async (req, res) => {
  const { isAvailable } = req.body;
  const driverId = req.user.id; // Driver ID from JWT

  try {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Update driver's availability
    driver.isAvailable = isAvailable;
    await driver.save();

    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating availability' });
  }
});

module.exports = router;