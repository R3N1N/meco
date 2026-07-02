const db = require('../config/db');

// Helper to convert time (HH:MM) to minutes since midnight
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper to convert minutes since midnight back to HH:MM
function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Retrieve available clinic slots or home service slots
exports.getSlots = async (req, res, next) => {
  try {
    const { type, date, doctor_id } = req.query;

    if (!type || !date) {
      return res.status(400).json({ message: 'Type and date are required parameters' });
    }

    if (type === 'home') {
      // Home visits are fixed 30-minute intervals between 10:00 AM and 6:00 PM (18:00)
      const startMinutes = timeToMinutes('10:00');
      const endMinutes = timeToMinutes('18:00');
      const interval = 30;

      const potentialSlots = [];
      for (let m = startMinutes; m <= endMinutes; m += interval) {
        potentialSlots.push(minutesToTime(m));
      }

      // Check which of these are already booked
      const [bookings] = await db.query(
        `SELECT appointment_time FROM appointments
         WHERE appointment_type = 'home' AND appointment_date = ? AND status != 'cancelled'`,
        [date]
      );

      const bookedTimes = new Set(bookings.map(b => b.appointment_time));

      const availableSlots = potentialSlots.map(time => ({
        time,
        is_booked: bookedTimes.has(time)
      }));

      return res.json(availableSlots);
    }

    if (type === 'clinic') {
      if (!doctor_id) {
        return res.status(400).json({ message: 'Doctor ID is required for clinic slots' });
      }

      // Get doctor schedule for the weekday of selected date
      // Date formats: YYYY-MM-DD
      const dateObj = new Date(date);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = dayNames[dateObj.getDay()];

      const [schedules] = await db.query(
        'SELECT start_time, end_time, slot_duration FROM doctor_schedules WHERE doctor_id = ? AND day_of_week = ?',
        [doctor_id, dayOfWeek]
      );

      if (schedules.length === 0) {
        return res.json([]); // No schedule configured for this day
      }

      const { start_time, end_time, slot_duration } = schedules[0];
      const startMin = timeToMinutes(start_time);
      const endMin = timeToMinutes(end_time);

      // Check if slots are already generated in database for this date
      const [existingSlots] = await db.query(
        'SELECT id, start_time, end_time, is_booked FROM appointment_slots WHERE doctor_id = ? AND slot_date = ?',
        [doctor_id, date]
      );

      if (existingSlots.length > 0) {
        return res.json(existingSlots);
      }

      // Generate slots in database if not present
      const newSlots = [];
      for (let m = startMin; m < endMin; m += slot_duration) {
        const slotStart = minutesToTime(m);
        const slotEnd = minutesToTime(m + slot_duration);
        newSlots.push({ start: slotStart, end: slotEnd });
      }

      for (const slot of newSlots) {
        try {
          await db.query(
            `INSERT INTO appointment_slots (doctor_id, slot_date, start_time, end_time, is_booked)
             VALUES (?, ?, ?, ?, 0)`,
            [doctor_id, date, slot.start, slot.end]
          );
        } catch (e) {
          // Ignore duplicate insert errors in case of parallel requests
        }
      }

      // Query database again to return clean values
      const [slots] = await db.query(
        'SELECT id, start_time, end_time, is_booked FROM appointment_slots WHERE doctor_id = ? AND slot_date = ?',
        [doctor_id, date]
      );

      return res.json(slots);
    }

    return res.status(400).json({ message: 'Invalid slot type' });
  } catch (error) {
    next(error);
  }
};

// Book an appointment (patient or guest)
exports.bookAppointment = async (req, res, next) => {
  try {
    const {
      appointment_type,
      appointment_date,
      appointment_time,
      doctor_id,
      slot_id,
      address,
      latitude,
      longitude,
      notes,
      guest_name,
      guest_email,
      guest_phone
    } = req.body;

    const patient_id = req.user ? req.user.id : null;

    if (!appointment_type || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: 'Missing core booking details (type, date, time)' });
    }

    // Guest user fields verification
    if (!patient_id && (!guest_name || !guest_email || !guest_phone)) {
      return res.status(400).json({ message: 'Guest contact info is required for unregistered bookings' });
    }

    if (appointment_type === 'clinic') {
      if (!slot_id || !doctor_id) {
        return res.status(400).json({ message: 'Doctor ID and Slot ID are required for clinic appointments' });
      }

      try {
        const apptId = await db.transaction(async (conn) => {
          // Select and LOCK slot using FOR UPDATE to prevent race conditions
          // In SQLite, transaction is serialized which has identical locking effect
          const lockQuery = db.getDbType() === 'mysql'
            ? 'SELECT id, is_booked, slot_date, start_time FROM appointment_slots WHERE id = ? FOR UPDATE'
            : 'SELECT id, is_booked, slot_date, start_time FROM appointment_slots WHERE id = ?';

          const [slots] = await conn.query(lockQuery, [slot_id]);

          if (slots.length === 0) {
            throw new Error('The requested clinic slot does not exist');
          }

          const slot = slots[0];
          // Boolean checks: SQLite returns 1/0, MySQL returns true/false
          if (slot.is_booked === 1 || slot.is_booked === true) {
            throw new Error('This clinic slot is already booked');
          }

          // Insert appointment
          const [apptResult] = await conn.query(
            `INSERT INTO appointments (patient_id, guest_name, guest_email, guest_phone, doctor_id, appointment_type, appointment_date, appointment_time, status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [patient_id, guest_name || null, guest_email || null, guest_phone || null, doctor_id, 'clinic', appointment_date, slot.start_time, notes || '']
          );

          const newApptId = apptResult.insertId;

          // Update slot to booked
          await conn.query(
            'UPDATE appointment_slots SET is_booked = 1, appointment_id = ? WHERE id = ?',
            [newApptId, slot_id]
          );

          return newApptId;
        });

        const [bookingDetails] = await db.query(
          `SELECT a.*, u.name as doctor_name 
           FROM appointments a
           LEFT JOIN doctors d ON a.doctor_id = d.id
           LEFT JOIN users u ON d.user_id = u.id
           WHERE a.id = ?`,
          [apptId]
        );

        return res.status(201).json({
          message: 'Clinic appointment booked successfully',
          booking: bookingDetails[0]
        });
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    }

    if (appointment_type === 'home') {
      if (!address || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: 'Address and map coordinates are required for home services' });
      }

      if (!isWithinValley(latitude, longitude)) {
        return res.status(400).json({
          message: 'Home service is only available inside Kathmandu, Lalitpur, and Bhaktapur'
        });
      }

      try {
        const apptId = await db.transaction(async (conn) => {
          // Check if slot is already booked for home service to prevent concurrent duplicates
          const lockQuery = db.getDbType() === 'mysql'
            ? `SELECT id FROM appointments 
               WHERE appointment_type = 'home' AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled' 
               FOR UPDATE`
            : `SELECT id FROM appointments 
               WHERE appointment_type = 'home' AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`;

          const [existing] = await conn.query(lockQuery, [appointment_date, appointment_time]);

          if (existing.length > 0) {
            throw new Error('This time slot is already booked for a home service visit');
          }

          // Insert home service appointment
          const [apptResult] = await conn.query(
            `INSERT INTO appointments (patient_id, guest_name, guest_email, guest_phone, appointment_type, appointment_date, appointment_time, status, address, latitude, longitude, notes)
             VALUES (?, ?, ?, ?, 'home', ?, ?, 'pending', ?, ?, ?, ?)`,
            [patient_id, guest_name || null, guest_email || null, guest_phone || null, appointment_date, appointment_time, address, latitude, longitude, notes || '']
          );

          return apptResult.insertId;
        });

        const [bookingDetails] = await db.query('SELECT * FROM appointments WHERE id = ?', [apptId]);

        return res.status(201).json({
          message: 'Home service appointment booked successfully',
          booking: bookingDetails[0]
        });
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    }

    return res.status(400).json({ message: 'Invalid appointment type' });
  } catch (error) {
    next(error);
  }
};

// Get list of appointments based on role permissions
exports.getAppointments = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    let appointments = [];

    if (role === 'admin') {
      // Admin gets all appointments with doctor name and patient name
      [appointments] = await db.query(
        `SELECT a.*, 
                p.name as patient_name, p.email as patient_email, p.phone as patient_phone,
                ud.name as doctor_name, d.specialization as doctor_specialization
         FROM appointments a
         LEFT JOIN users p ON a.patient_id = p.id
         LEFT JOIN doctors d ON a.doctor_id = d.id
         LEFT JOIN users ud ON d.user_id = ud.id
         ORDER BY a.appointment_date DESC, a.appointment_time DESC`
      );
    } else if (role === 'doctor') {
      // Doctor gets appointments assigned to them
      const doctorId = req.user.doctorId;
      [appointments] = await db.query(
        `SELECT a.*, 
                p.name as patient_name, p.email as patient_email, p.phone as patient_phone
         FROM appointments a
         LEFT JOIN users p ON a.patient_id = p.id
         WHERE a.doctor_id = ?
         ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
        [doctorId]
      );
    } else if (role === 'patient') {
      // Patient gets their own appointments
      [appointments] = await db.query(
        `SELECT a.*, 
                ud.name as doctor_name, d.specialization as doctor_specialization
         FROM appointments a
         LEFT JOIN doctors d ON a.doctor_id = d.id
         LEFT JOIN users ud ON d.user_id = ud.id
         WHERE a.patient_id = ?
         ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
        [userId]
      );
    }

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

// Update appointment status (confirm, complete, cancel)
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // pending, confirmed, completed, cancelled
    const role = req.user.role;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const [appointments] = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appt = appointments[0];

    // Authorize updates:
    // Patient can only cancel their own.
    // Doctor can update status of their own assigned.
    // Admin can update anything.
    if (role === 'patient') {
      if (appt.patient_id !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized to modify this appointment' });
      }
      if (status !== 'cancelled') {
        return res.status(403).json({ message: 'Patients can only cancel appointments' });
      }
    } else if (role === 'doctor') {
      if (appt.doctor_id !== req.user.doctorId) {
        return res.status(403).json({ message: 'Unauthorized: This appointment is not assigned to you' });
      }
    }

    await db.transaction(async (conn) => {
      // Update appointment status
      await conn.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);

      // If status is cancelled and it was a clinic appointment, free the slot
      if (status === 'cancelled' && appt.appointment_type === 'clinic') {
        await conn.query(
          'UPDATE appointment_slots SET is_booked = 0, appointment_id = NULL WHERE appointment_id = ?',
          [id]
        );
      }
    });

    res.json({ message: `Appointment status updated to ${status} successfully` });
  } catch (error) {
    next(error);
  }
};

// Edit appointment date, time, or assign doctor (Admin only)
exports.editAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { appointment_date, appointment_time, doctor_id, status } = req.body;

    const [appointments] = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appt = appointments[0];

    await db.transaction(async (conn) => {
      // 1. If clinic appointment is changed, clear old slot
      if (appt.appointment_type === 'clinic' && (appointment_date !== appt.appointment_date || appointment_time !== appt.appointment_time || doctor_id !== appt.doctor_id)) {
        await conn.query(
          'UPDATE appointment_slots SET is_booked = 0, appointment_id = NULL WHERE appointment_id = ?',
          [id]
        );

        // Find or create new slot
        // For simplicity, we create a custom slot if it doesn't exist to accommodate manual overrides
        if (doctor_id) {
          const [existingSlots] = await conn.query(
            'SELECT id, is_booked FROM appointment_slots WHERE doctor_id = ? AND slot_date = ? AND start_time = ?',
            [doctor_id, appointment_date, appointment_time]
          );

          if (existingSlots.length > 0) {
            const slot = existingSlots[0];
            if (slot.is_booked) {
              throw new Error('The target slot is already booked by another appointment');
            }
            await conn.query(
              'UPDATE appointment_slots SET is_booked = 1, appointment_id = ? WHERE id = ?',
              [id, slot.id]
            );
          } else {
            // Generate single custom slot
            const [newSlotResult] = await conn.query(
              `INSERT INTO appointment_slots (doctor_id, slot_date, start_time, end_time, is_booked, appointment_id)
               VALUES (?, ?, ?, ?, 1, ?)`,
              [doctor_id, appointment_date, appointment_time, appointment_time, id]
            );
          }
        }
      }

      // 2. Perform main update
      await conn.query(
        `UPDATE appointments 
         SET appointment_date = ?, appointment_time = ?, doctor_id = ?, status = ?
         WHERE id = ?`,
        [appointment_date, appointment_time, doctor_id || null, status || appt.status, id]
      );
    });

    res.json({ message: 'Appointment updated successfully by admin' });
  } catch (error) {
    next(error);
  }
};

// Geocoding Proxy (Forward search)
exports.geocodeProxy = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Query parameter q is required' });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=np&limit=5&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EyeCareApp/1.0 (admin@eyecare.com)',
        'Accept-Language': 'en'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Nominatim geocoding failed' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Geocoding Proxy Error:', error);
    next(error);
  }
};

// Reverse Geocoding Proxy
exports.reverseGeocodeProxy = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude parameters are required' });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EyeCareApp/1.0 (admin@eyecare.com)',
        'Accept-Language': 'en'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Nominatim reverse geocoding failed' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Reverse Geocoding Proxy Error:', error);
    next(error);
  }
};
