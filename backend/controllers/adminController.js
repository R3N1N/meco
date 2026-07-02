const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Get overview statistics for the admin dashboard
exports.getStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const statsQueries = {
      totalAppointments: 'SELECT COUNT(*) as count FROM appointments',
      todayAppointments: 'SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?',
      homeVisits: "SELECT COUNT(*) as count FROM appointments WHERE appointment_type = 'home'",
      clinicVisits: "SELECT COUNT(*) as count FROM appointments WHERE appointment_type = 'clinic'",
      completedAppointments: "SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'",
      cancelledAppointments: "SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'",
      activeDoctors: "SELECT COUNT(*) as count FROM users WHERE role = 'doctor' AND status = 'active'",
      registeredPatients: "SELECT COUNT(*) as count FROM users WHERE role = 'patient'"
    };

    const stats = {};
    for (const [key, sql] of Object.entries(statsQueries)) {
      const params = key === 'todayAppointments' ? [today] : [];
      const [rows] = await db.query(sql, params);
      stats[key] = rows[0].count;
    }

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// View and filter all system users (patients & doctors)
exports.getUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, phone, address, status, created_at FROM users WHERE role != \'admin\' ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Toggle user status (activate / deactivate)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // active, inactive

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const [existing] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (existing[0].role === 'admin') {
      return res.status(400).json({ message: 'Cannot change status of an administrator' });
    }

    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: `User status changed to ${status} successfully` });
  } catch (error) {
    next(error);
  }
};

// Add a new doctor (creates User + Doctor Profile)
exports.addDoctor = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, specialization, experience_years, biography, consultation_fee } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({ message: 'Name, email, password, and specialization are required' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.transaction(async (conn) => {
      // 1. Insert into users
      const [uResult] = await conn.query(
        'INSERT INTO users (name, email, password, role, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, 'doctor', phone || null, address || null, 'active']
      );
      
      const newUserId = uResult.insertId;

      // 2. Insert into doctors
      await conn.query(
        'INSERT INTO doctors (user_id, specialization, experience_years, biography, consultation_fee) VALUES (?, ?, ?, ?, ?)',
        [newUserId, specialization, experience_years || 0, biography || '', consultation_fee || 0.00]
      );
    });

    res.status(201).json({ message: 'Doctor registered successfully' });
  } catch (error) {
    next(error);
  }
};

// Edit doctor info (Admin overrides)
exports.editDoctor = async (req, res, next) => {
  try {
    const { id } = req.params; // doctor_id (not user_id)
    const { name, phone, address, specialization, experience_years, biography, consultation_fee, status } = req.body;

    const [doctors] = await db.query('SELECT user_id FROM doctors WHERE id = ?', [id]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const userId = doctors[0].user_id;

    await db.transaction(async (conn) => {
      // 1. Update user fields
      await conn.query(
        'UPDATE users SET name = ?, phone = ?, address = ?, status = ? WHERE id = ?',
        [name, phone || null, address || null, status || 'active', userId]
      );

      // 2. Update doctor fields
      await conn.query(
        `UPDATE doctors 
         SET specialization = ?, experience_years = ?, biography = ?, consultation_fee = ?
         WHERE id = ?`,
        [specialization, experience_years || 0, biography || '', consultation_fee || 0.00, id]
      );
    });

    res.json({ message: 'Doctor details updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete Doctor Profile and deactivate account
exports.deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params; // doctor_id

    const [doctors] = await db.query('SELECT user_id FROM doctors WHERE id = ?', [id]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const userId = doctors[0].user_id;

    await db.transaction(async (conn) => {
      // Set user status to inactive
      await conn.query("UPDATE users SET status = 'inactive' WHERE id = ?", [userId]);
      // Remove schedules
      await conn.query('DELETE FROM doctor_schedules WHERE doctor_id = ?', [id]);
    });

    res.json({ message: 'Doctor deactivated and schedules cleared successfully' });
  } catch (error) {
    next(error);
  }
};

// Generate reports statistics
exports.getReports = async (req, res, next) => {
  try {
    // 1. Appointment type ratios
    const [typeStats] = await db.query(
      "SELECT appointment_type as label, COUNT(*) as count FROM appointments GROUP BY appointment_type"
    );

    // 2. Appointment status distribution
    const [statusStats] = await db.query(
      "SELECT status as label, COUNT(*) as count FROM appointments GROUP BY status"
    );

    // 3. Doctor activity: doctor name, specialization, total assigned, total completed
    const [doctorActivity] = await db.query(
      `SELECT u.name as doctor_name, d.specialization,
              COUNT(a.id) as total_appointments,
              SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_appointments
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       LEFT JOIN appointments a ON d.id = a.doctor_id
       GROUP BY d.id, u.name, d.specialization`
    );

    // 4. Appointment bookings timeline (last 7 days counts)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      days.push(dateStr);
    }

    const timeline = [];
    for (const date of days) {
      const [countRows] = await db.query(
        'SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?',
        [date]
      );
      timeline.push({
        date: date,
        count: countRows[0].count
      });
    }

    res.json({
      typeStats,
      statusStats,
      doctorActivity,
      timeline
    });
  } catch (error) {
    next(error);
  }
};
