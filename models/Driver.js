const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vehicleType: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  password: { type: String, required: true },  // hashed password
  currentLocation: {
    lat: Number,
    lng: Number
  },
  trips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
});

module.exports = mongoose.model('Driver', DriverSchema);