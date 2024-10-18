const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');

const router = express.Router();

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretKey';

// User Sign-Up
router.post('/user/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, phone, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
});

// User Login
router.post('/user/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: 'User logged in successfully', userid: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Driver Sign-Up
router.post('/driver/signup', async (req, res) => {
  const { name, vehicleType, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newDriver = new Driver({ name, vehicleType, password: hashedPassword });

    await newDriver.save();
    res.status(201).json({ message: 'Driver registered successfully',  userid: newDriver._id });
  } catch (error) {
    res.status(400).json({ error: 'Error creating driver' });
  }
});

// Driver Login
router.post('/driver/login', async (req, res) => {
  const { name, password } = req.body;

  try {
    const driver = await Driver.findOne({ name });
    if (!driver) return res.status(400).json({ error: 'Driver not found' });

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: driver._id, name: driver.name }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: 'Driver logged in successfully', userid: driver._id});
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

module.exports = router;