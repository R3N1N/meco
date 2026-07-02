const db = require('../config/db');

// List all active doctors and details
exports.getDoctors = async (req, res, next) => {
  try {
    const [doctors] = await db.query(
      `SELECT d.id as doctor_id, u.id as user_id, u.name, u.email, u.phone, u.address,
              d.specialization, d.experience_years, d.biography, d.consultation_fee
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE u.status = 'active'`
    );
    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

// Update doctor profile (specialization, fee, bio, experience)
exports.updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params; // doctor_id
    const { specialization, experience_years, biography, consultation_fee } = req.body;

    // Check permissions: must be the doctor themselves or an admin
    const [doctorRows] = await db.query('SELECT user_id FROM doctors WHERE id = ?', [id]);
    if (doctorRows.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const doctorUserId = doctorRows[0].user_id;

    if (req.user.role !== 'admin' && req.user.id !== doctorUserId) {
      return res.status(403).json({ message: 'Unauthorized to update this doctor profile' });
    }

    if (!specialization) {
      return res.status(400).json({ message: 'Specialization is required' });
    }

    await db.query(
      `UPDATE doctors
       SET specialization = ?, experience_years = ?, biography = ?, consultation_fee = ?
       WHERE id = ?`,
      [specialization, experience_years || 0, biography || '', consultation_fee || 0.00, id]
    );

    res.json({ message: 'Doctor profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Fetch general schedules of a doctor
exports.getSchedules = async (req, res, next) => {
  try {
    const { id } = req.params; // doctor_id or 'me'
    let doctorId = id;

    if (id === 'me') {
      if (!req.user || req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Access denied: You are not registered as a doctor' });
      }
      doctorId = req.user.doctorId;
    }

    const [schedules] = await db.query(
      'SELECT id, day_of_week, start_time, end_time, slot_duration FROM doctor_schedules WHERE doctor_id = ?',
      [doctorId]
    );
    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

// Create or update doctor schedule configurations
exports.createSchedule = async (req, res, next) => {
  try {
    const { day_of_week, start_time, end_time, slot_duration } = req.body;
    let doctorId = req.body.doctor_id;

    if (req.user.role === 'doctor') {
      doctorId = req.user.doctorId;
    }

    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }

    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({ message: 'Day of week, start time, and end time are required' });
    }

    // Check if schedule overlaps or exists for the same day
    const [existing] = await db.query(
      'SELECT id FROM doctor_schedules WHERE doctor_id = ? AND day_of_week = ?',
      [doctorId, day_of_week]
    );

    if (existing.length > 0) {
      // Update existing day schedule
      await db.query(
        `UPDATE doctor_schedules
         SET start_time = ?, end_time = ?, slot_duration = ?
         WHERE doctor_id = ? AND day_of_week = ?`,
        [start_time, end_time, slot_duration || 15, doctorId, day_of_week]
      );
      return res.json({ message: 'Schedule updated successfully' });
    } else {
      // Insert new day schedule
      await db.query(
        `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration)
         VALUES (?, ?, ?, ?, ?)`,
        [doctorId, day_of_week, start_time, end_time, slot_duration || 15]
      );
      return res.status(201).json({ message: 'Schedule created successfully' });
    }
  } catch (error) {
    next(error);
  }
};

// Delete schedule configuration
exports.deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params; // schedule_id
    
    // If user is a doctor, verify they own the schedule
    if (req.user.role === 'doctor') {
      const [scheduleRows] = await db.query(
        'SELECT doctor_id FROM doctor_schedules WHERE id = ?',
        [id]
      );
      if (scheduleRows.length === 0) {
        return res.status(404).json({ message: 'Schedule entry not found' });
      }
      if (scheduleRows[0].doctor_id !== req.user.doctorId) {
        return res.status(403).json({ message: 'Unauthorized to delete this schedule' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await db.query('DELETE FROM doctor_schedules WHERE id = ?', [id]);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Update schedule configuration
exports.updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params; // schedule_id
    const { day_of_week, start_time, end_time, slot_duration } = req.body;
    let doctorId = req.user.doctorId;

    if (req.user.role === 'admin' && req.body.doctor_id) {
      doctorId = req.body.doctor_id;
    }

    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }

    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({ message: 'Day of week, start time, and end time are required' });
    }

    // Verify schedule exists and belongs to the doctor (if not admin)
    const [scheduleRows] = await db.query(
      'SELECT doctor_id FROM doctor_schedules WHERE id = ?',
      [id]
    );

    if (scheduleRows.length === 0) {
      return res.status(404).json({ message: 'Schedule template not found' });
    }

    if (req.user.role !== 'admin' && scheduleRows[0].doctor_id !== doctorId) {
      return res.status(403).json({ message: 'Unauthorized to update this schedule template' });
    }

    // Check if another schedule exists for the same day_of_week (different ID)
    const [conflict] = await db.query(
      'SELECT id FROM doctor_schedules WHERE doctor_id = ? AND day_of_week = ? AND id != ?',
      [doctorId, day_of_week, id]
    );

    if (conflict.length > 0) {
      return res.status(400).json({ message: `A schedule template for ${day_of_week} already exists.` });
    }

    await db.query(
      `UPDATE doctor_schedules
       SET day_of_week = ?, start_time = ?, end_time = ?, slot_duration = ?
       WHERE id = ?`,
      [day_of_week, start_time, end_time, slot_duration || 15, id]
    );

    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    next(error);
  }
};

