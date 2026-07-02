const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_eyecare_jwt_token_key_123!';

// Register a new patient
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user (force role to patient for security)
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'patient', phone || null, address || null, 'active']
    );

    const userId = result.insertId;

    // Generate JWT
    const token = jwt.sign(
      { id: userId, name, email, role: 'patient' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        name,
        email,
        role: 'patient',
        phone,
        address
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check status
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact an administrator.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If doctor, fetch doctor_id for convenience in frontend
    let doctorId = null;
    if (user.role === 'doctor') {
      const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [user.id]);
      if (doctors && doctors.length > 0) {
        doctorId = doctors[0].id;
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, doctorId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        doctorId
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [users] = await db.query('SELECT id, name, email, role, phone, address, status, created_at FROM users WHERE id = ?', [userId]);
    
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    
    let doctorId = null;
    let specialization = null;
    
    if (user.role === 'doctor') {
      const [doctors] = await db.query('SELECT id, specialization FROM doctors WHERE user_id = ?', [user.id]);
      if (doctors && doctors.length > 0) {
        doctorId = doctors[0].id;
        specialization = doctors[0].specialization;
      }
    }

    res.json({
      user: {
        ...user,
        doctorId,
        specialization
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update current user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    await db.query(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [name, phone || null, address || null, userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: userId,
        name,
        phone,
        address
      }
    });
  } catch (error) {
    next(error);
  }
};
