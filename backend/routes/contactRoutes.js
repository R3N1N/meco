const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Submit contact inquiry (Public)
router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields (name, email, subject, message) are required.' });
    }

    await db.query(
      'INSERT INTO contact_inquiries (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject, message]
    );

    res.status(201).json({ message: 'Message submitted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
