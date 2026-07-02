const db = require('../config/db');

// Save Visual Acuity Test Results
exports.saveVATest = async (req, res, next) => {
  try {
    const { right_eye_va, left_eye_va, interpretation, guest_name } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!right_eye_va || !left_eye_va) {
      return res.status(400).json({ message: 'Right eye and left eye acuity values are required' });
    }

    // Standard Snellen chart interpretations
    let calculatedInterpretation = interpretation;
    if (!calculatedInterpretation) {
      calculatedInterpretation = `Right Eye: ${right_eye_va}, Left Eye: ${left_eye_va}. `;
      if (right_eye_va === '6/6' && left_eye_va === '6/6') {
        calculatedInterpretation += 'Normal visual acuity in both eyes.';
      } else {
        calculatedInterpretation += 'Subnormal vision detected. It is recommended to consult an optometrist.';
      }
    }

    // Save to DB only if user is logged in (otherwise guest gets returned calculations only)
    if (userId) {
      await db.query(
        `INSERT INTO va_tests (user_id, guest_name, right_eye_va, left_eye_va, interpretation)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, null, right_eye_va, left_eye_va, calculatedInterpretation]
      );
      return res.status(201).json({
        message: 'Visual acuity test results saved successfully',
        result: {
          user_id: userId,
          right_eye_va,
          left_eye_va,
          interpretation: calculatedInterpretation
        }
      });
    }

    // Guest response (no database write)
    return res.json({
      message: 'Visual acuity test completed (guest mode, not saved)',
      result: {
        user_id: null,
        right_eye_va,
        left_eye_va,
        interpretation: calculatedInterpretation
      }
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve test history for the logged-in user
exports.getVAHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let history = [];
    if (role === 'admin') {
      [history] = await db.query(
        `SELECT vt.*, u.name as patient_name, u.email as patient_email
         FROM va_tests vt
         LEFT JOIN users u ON vt.user_id = u.id
         ORDER BY vt.created_at DESC`
      );
    } else {
      [history] = await db.query(
        'SELECT id, right_eye_va, left_eye_va, interpretation, created_at FROM va_tests WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
    }

    res.json(history);
  } catch (error) {
    next(error);
  }
};
