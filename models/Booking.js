const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: String,
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  pickupLocation: {
    lat: Number,
    lng: Number
  },
  dropoffLocation: {
    lat: Number,
    lng: Number
  },
  price: Number,
  status: { type: String, default: 'pending' } // pending, accepted, completed
});

module.exports = mongoose.model('Booking', BookingSchema);