const express = require('express');
const Booking = require('../models/Booking'); // Assuming you have a Booking model
const Driver = require('../models/Driver');
const router = express.Router();
const authenticate = require('../middlewares/authenticate'); // Middleware for authentication

// Create a booking
router.post('/', authenticate, async (req, res) => {
  const { driverId, pickupLocation, dropoffLocation, vehicleType } = req.body;
  const userId = req.user.id; // Assuming user ID from JWT

  try {
    // Find the driver
    const driver = await Driver.findById(driverId);
    if (!driver || !driver.isAvailable) {
      return res.status(400).json({ error: 'Driver is not available' });
    }

    // Create a new booking
    const booking = new Booking({
      userId,
      driverId,
      pickupLocation,
      dropoffLocation,
      vehicleType,
      status: 'booked',
      price: calculatePrice(pickupLocation, dropoffLocation, vehicleType), // A function to calculate price
    });

    await booking.save();

    // Mark the driver as unavailable
    driver.isAvailable = false;
    await driver.save();

    const io = req.app.get('socketio'); // Get the Socket.io instance
    io.emit('driver-booked', driverId); // Notify other users that this driver is booked

    res.json({ message: 'Booking created successfully', booking });
  } catch (error) {
    res.status(500).json({ error: 'Error creating booking' });
  }
});

// Helper function to calculate price (simple example)
function calculatePrice(pickupLocation, dropoffLocation, vehicleType) {
  // Calculate distance between pickup and dropoff locations (use Haversine formula or similar)
  const distance = calculateDistance(pickupLocation.lat, pickupLocation.lng, dropoffLocation.lat, dropoffLocation.lng);
  
  // Base price logic based on vehicle type
  let basePrice = 50; // Base price for booking
  let pricePerKm = vehicleType === 'truck' ? 15 : 10; // Higher price for trucks

  // Return the calculated price
  return basePrice + pricePerKm * distance;
}

// Function to calculate distance using the Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

module.exports = router;