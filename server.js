const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const userRoutes = require('./routes/user');
const driverRoutes = require('./routes/driver');
const bookingRoutes = require('./routes/booking');
const auth = require('./routes/auth');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable CORS for your Express app
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL (allowing only the React frontend in this case)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Socket.io setup with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true // Allow credentials (such as cookies) if needed
  }
});

// Middleware to parse request bodies
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/book', bookingRoutes);
app.use('/auth', auth);

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Store io instance for other routes
app.set('socketio', io);

const Driver = require('./models/Driver'); // Make sure the Driver model is available

io.on('connection', (socket) => {
  console.log('Driver connected:', socket.id);

  // Listen for driver location updates
  socket.on('driver-location-update', async (data) => {
    // const driverId = socket.handshake.query.driverId; // Assuming you have the driver's ID in the query
    const { driverId,lat, lng } = data;

    console.log(`Received location update for driver ${driverId}:, ${lat}, ${lng}`);

    // Update the driver's location in the database
    try {
      const driver = await Driver.findById(driverId);
      if (driver) {
        driver.currentLocation = { lat, lng };
        await driver.save(); // Save the updated location to the database
        console.log(`Updated location for driver ${driverId} in the database`);
      } else {
        console.error(`Driver with ID ${driverId} not found`);
      }
    } catch (error) {
      console.error('Error updating driver location:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Driver disconnected:', socket.id);
  });
});




// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));