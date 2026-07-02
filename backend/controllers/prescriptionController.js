const db = require('../config/db');
const PDFDocument = require('pdfkit');

// Create prescription (Doctor only)
exports.createPrescription = async (req, res, next) => {
  try {
    const doctorId = req.user.doctorId;
    if (!doctorId) {
      return res.status(403).json({ message: 'Only registered doctors can create prescriptions' });
    }

    const {
      appointment_id,
      patient_id,
      diagnosis,
      notes,
      sph_od,
      cyl_od,
      axis_od,
      sph_os,
      cyl_os,
      axis_os,
      va_unaided_od,
      va_aided_od,
      va_unaided_os,
      va_aided_os,
      pd,
      add_power,
      add_od,
      add_os,
      medicines // Array of { medicine_name, dosage, frequency, duration }
    } = req.body;

    if (!patient_id && !appointment_id) {
      return res.status(400).json({ message: 'Patient ID or Appointment ID is required' });
    }
    if (!diagnosis) {
      return res.status(400).json({ message: 'Diagnosis is required' });
    }

    const prescriptionId = await db.transaction(async (conn) => {
      // 1. Insert prescription record
      const [pResult] = await conn.query(
        `INSERT INTO prescriptions 
          (appointment_id, patient_id, doctor_id, diagnosis, notes, 
           sph_od, cyl_od, axis_od, sph_os, cyl_os, axis_os, 
           va_unaided_od, va_aided_od, va_unaided_os, va_aided_os, pd, add_power, add_od, add_os)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          appointment_id || null,
          patient_id || null,
          doctorId,
          diagnosis,
          notes || '',
          sph_od !== undefined ? sph_od : null,
          cyl_od !== undefined ? cyl_od : null,
          axis_od !== undefined ? axis_od : null,
          sph_os !== undefined ? sph_os : null,
          cyl_os !== undefined ? cyl_os : null,
          axis_os !== undefined ? axis_os : null,
          va_unaided_od !== undefined ? va_unaided_od : null,
          va_aided_od !== undefined ? va_aided_od : null,
          va_unaided_os !== undefined ? va_unaided_os : null,
          va_aided_os !== undefined ? va_aided_os : null,
          pd !== undefined ? pd : null,
          add_power !== undefined ? add_power : null,
          add_od !== undefined ? add_od : null,
          add_os !== undefined ? add_os : null
        ]
      );
      
      const newPrescriptionId = pResult.insertId;

      // 2. Insert medicines
      if (medicines && Array.isArray(medicines) && medicines.length > 0) {
        for (const item of medicines) {
          await conn.query(
            `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration)
             VALUES (?, ?, ?, ?, ?)`,
            [newPrescriptionId, item.medicine_name, item.dosage, item.frequency, item.duration]
          );
        }
      }

      // 3. Mark appointment as completed if linked
      if (appointment_id) {
        await conn.query(
          "UPDATE appointments SET status = 'completed' WHERE id = ?",
          [appointment_id]
        );
      }

      return newPrescriptionId;
    });

    res.status(201).json({
      message: 'Prescription created successfully',
      prescriptionId
    });
  } catch (error) {
    next(error);
  }
};

// Update prescription (Doctor only)
exports.updatePrescription = async (req, res, next) => {
  try {
    const doctorId = req.user.doctorId;
    const { id } = req.params; // prescription_id

    const [existing] = await db.query('SELECT doctor_id FROM prescriptions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (existing[0].doctor_id !== doctorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this prescription' });
    }

    const {
      diagnosis,
      notes,
      sph_od,
      cyl_od,
      axis_od,
      sph_os,
      cyl_os,
      axis_os,
      va_unaided_od,
      va_aided_od,
      va_unaided_os,
      va_aided_os,
      pd,
      add_power,
      add_od,
      add_os,
      medicines
    } = req.body;

    await db.transaction(async (conn) => {
      // 1. Update main prescription parameters
      await conn.query(
        `UPDATE prescriptions 
         SET diagnosis = ?, notes = ?, 
             sph_od = ?, cyl_od = ?, axis_od = ?, 
             sph_os = ?, cyl_os = ?, axis_os = ?, 
             va_unaided_od = ?, va_aided_od = ?, va_unaided_os = ?, va_aided_os = ?,
             pd = ?, add_power = ?, add_od = ?, add_os = ?
         WHERE id = ?`,
        [
          diagnosis, notes || '',
          sph_od, cyl_od, axis_od,
          sph_os, cyl_os, axis_os,
          va_unaided_od !== undefined ? va_unaided_od : null,
          va_aided_od !== undefined ? va_aided_od : null,
          va_unaided_os !== undefined ? va_unaided_os : null,
          va_aided_os !== undefined ? va_aided_os : null,
          pd, add_power,
          add_od !== undefined ? add_od : null,
          add_os !== undefined ? add_os : null,
          id
        ]
      );

      // 2. Remove old medicines
      await conn.query('DELETE FROM prescription_items WHERE prescription_id = ?', [id]);

      // 3. Insert new medicines
      if (medicines && Array.isArray(medicines) && medicines.length > 0) {
        for (const item of medicines) {
          await conn.query(
            `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration)
             VALUES (?, ?, ?, ?, ?)`,
            [id, item.medicine_name, item.dosage, item.frequency, item.duration]
          );
        }
      }
    });

    res.json({ message: 'Prescription updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Retrieve prescriptions based on role
exports.getPrescriptions = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    let prescriptions = [];

    if (role === 'admin') {
      [prescriptions] = await db.query(
        `SELECT pr.*, 
                COALESCE(up.name, appt.guest_name) as patient_name,
                COALESCE(up.email, appt.guest_email) as patient_email,
                ud.name as doctor_name
         FROM prescriptions pr
         LEFT JOIN users up ON pr.patient_id = up.id
         LEFT JOIN appointments appt ON pr.appointment_id = appt.id
         LEFT JOIN doctors d ON pr.doctor_id = d.id
         LEFT JOIN users ud ON d.user_id = ud.id
         ORDER BY pr.created_at DESC`
      );
    } else if (role === 'doctor') {
      const doctorId = req.user.doctorId;
      [prescriptions] = await db.query(
        `SELECT pr.*, 
                COALESCE(up.name, appt.guest_name) as patient_name,
                COALESCE(up.email, appt.guest_email) as patient_email
         FROM prescriptions pr
         LEFT JOIN users up ON pr.patient_id = up.id
         LEFT JOIN appointments appt ON pr.appointment_id = appt.id
         WHERE pr.doctor_id = ?
         ORDER BY pr.created_at DESC`,
        [doctorId]
      );
    } else if (role === 'patient') {
      [prescriptions] = await db.query(
        `SELECT pr.*, 
                ud.name as doctor_name, d.specialization as doctor_specialization
         FROM prescriptions pr
         LEFT JOIN doctors d ON pr.doctor_id = d.id
         LEFT JOIN users ud ON d.user_id = ud.id
         WHERE pr.patient_id = ?
         ORDER BY pr.created_at DESC`,
        [userId]
      );
    }

    res.json(prescriptions);
  } catch (error) {
    next(error);
  }
};

// Retrieve a detailed prescription (single)
exports.getPrescriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [prescriptions] = await db.query(
      `SELECT pr.*, 
              COALESCE(up.name, appt.guest_name) as patient_name,
              COALESCE(up.email, appt.guest_email) as patient_email,
              COALESCE(up.phone, appt.guest_phone) as patient_phone,
              COALESCE(up.address, appt.address) as patient_address,
              ud.name as doctor_name, d.specialization as doctor_specialization, ud.phone as doctor_phone
       FROM prescriptions pr
       LEFT JOIN users up ON pr.patient_id = up.id
       LEFT JOIN appointments appt ON pr.appointment_id = appt.id
       LEFT JOIN doctors d ON pr.doctor_id = d.id
       LEFT JOIN users ud ON d.user_id = ud.id
       WHERE pr.id = ?`,
      [id]
    );

    if (prescriptions.length === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const prescription = prescriptions[0];

    // Authorization checks
    if (req.user.role === 'patient' && prescription.patient_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.user.role === 'doctor' && prescription.doctor_id !== req.user.doctorId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Fetch items
    const [items] = await db.query(
      'SELECT id, medicine_name, dosage, frequency, duration FROM prescription_items WHERE prescription_id = ?',
      [id]
    );

    prescription.medicines = items;

    res.json(prescription);
  } catch (error) {
    next(error);
  }
};

// Compile PDF binary and return as download stream
exports.generatePDF = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Retrieve detailed prescription (same authorization checks)
    const [prescriptions] = await db.query(
      `SELECT pr.*, 
              COALESCE(up.name, appt.guest_name) as patient_name,
              COALESCE(up.email, appt.guest_email) as patient_email,
              COALESCE(up.phone, appt.guest_phone) as patient_phone,
              COALESCE(up.address, appt.address) as patient_address,
              ud.name as doctor_name, d.specialization as doctor_specialization
       FROM prescriptions pr
       LEFT JOIN users up ON pr.patient_id = up.id
       LEFT JOIN appointments appt ON pr.appointment_id = appt.id
       LEFT JOIN doctors d ON pr.doctor_id = d.id
       LEFT JOIN users ud ON d.user_id = ud.id
       WHERE pr.id = ?`,
      [id]
    );

    if (prescriptions.length === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const pr = prescriptions[0];

    if (req.user.role === 'patient' && pr.patient_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.user.role === 'doctor' && pr.doctor_id !== req.user.doctorId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Fetch items
    const [items] = await db.query(
      'SELECT medicine_name, dosage, frequency, duration FROM prescription_items WHERE prescription_id = ?',
      [id]
    );

    // PDF generation settings
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription_${id}.pdf`);
    doc.pipe(res);

    // --- Header ---
    doc.fillColor('#1e3a8a').fontSize(26).text('EYECARE MANAGEMENT SYSTEM', { align: 'center', underline: true });
    doc.fillColor('#4b5563').fontSize(10).text('Premium Vision & Medical Services', { align: 'center' });
    doc.moveDown(1.5);

    // --- Hospital & Doctor Metadata ---
    doc.fillColor('#1f2937').fontSize(12).text(`Doctor: Dr. ${pr.doctor_name}`, { bullet: false });
    doc.fontSize(10).text(`Specialization: ${pr.doctor_specialization || 'Optometrist'}`);
    doc.moveDown(0.5);
    
    // Line separator
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#d1d5db').lineWidth(1).stroke();
    doc.moveDown(1.5);

    // --- Patient Metadata ---
    doc.fontSize(12).fillColor('#1f2937').text(`Patient Name: ${pr.patient_name}`);
    doc.fontSize(10).text(`Email: ${pr.patient_email || 'N/A'}  |  Phone: ${pr.patient_phone || 'N/A'}`);
    doc.text(`Date of Issue: ${new Date(pr.created_at).toLocaleDateString()}`);
    doc.moveDown(1.5);
    
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#d1d5db').lineWidth(1).stroke();
    doc.moveDown(1.5);

    // --- Refraction Details Table ---
    doc.fontSize(14).fillColor('#1e3a8a').text('Refraction Details (Rx)', { underline: true });
    doc.moveDown(0.5);

    // Define table coordinates and drawing helper
    const rxY = doc.y;
    doc.fontSize(10).fillColor('#1f2937');
    
    // Draw columns
    doc.text('Eye', 50, rxY, { width: 60, bold: true });
    doc.text('SPH', 110, rxY, { width: 60 });
    doc.text('CYL', 170, rxY, { width: 60 });
    doc.text('AXIS', 230, rxY, { width: 60 });
    doc.text('Unaided VA (m)', 290, rxY, { width: 90 });
    doc.text('Aided VA (m)', 380, rxY, { width: 90 });
    
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(500, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke();
    doc.moveDown(0.5);

    const rightY = doc.y;
    doc.text('Right (OD)', 50, rightY);
    doc.text(pr.sph_od !== null ? String(pr.sph_od) : '-', 110, rightY);
    doc.text(pr.cyl_od !== null ? String(pr.cyl_od) : '-', 170, rightY);
    doc.text(pr.axis_od !== null ? String(pr.axis_od) : '-', 230, rightY);
    doc.text(pr.va_unaided_od !== null ? String(pr.va_unaided_od) : '-', 290, rightY);
    doc.text(pr.va_aided_od !== null ? String(pr.va_aided_od) : '-', 380, rightY);

    doc.moveDown(0.5);
    const leftY = doc.y;
    doc.text('Left (OS)', 50, leftY);
    doc.text(pr.sph_os !== null ? String(pr.sph_os) : '-', 110, leftY);
    doc.text(pr.cyl_os !== null ? String(pr.cyl_os) : '-', 170, leftY);
    doc.text(pr.axis_os !== null ? String(pr.axis_os) : '-', 230, leftY);
    doc.text(pr.va_unaided_os !== null ? String(pr.va_unaided_os) : '-', 290, leftY);
    doc.text(pr.va_aided_os !== null ? String(pr.va_aided_os) : '-', 380, leftY);
    
    doc.moveDown(1);
    doc.text(`Pupillary Distance (PD): ${pr.pd !== null ? pr.pd + ' mm' : '-'}  |  ADD OD: ${pr.add_od !== null ? '+' + pr.add_od : '-'}  |  ADD OS: ${pr.add_os !== null ? '+' + pr.add_os : '-'}`, 50, doc.y);
    doc.moveDown(2);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#d1d5db').lineWidth(1).stroke();
    doc.moveDown(1.5);

    // --- Diagnosis & Notes ---
    doc.fontSize(14).fillColor('#1e3a8a').text('Diagnosis', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#1f2937').text(pr.diagnosis, { align: 'justify' });
    doc.moveDown(1.5);

    if (pr.notes) {
      doc.fontSize(14).fillColor('#1e3a8a').text('Notes', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#1f2937').text(pr.notes, { align: 'justify' });
      doc.moveDown(1.5);
    }

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#d1d5db').lineWidth(1).stroke();
    doc.moveDown(1.5);

    // --- Medicines Table ---
    doc.fontSize(14).fillColor('#1e3a8a').text('Prescribed Medicines', { underline: true });
    doc.moveDown(0.5);

    if (items.length === 0) {
      doc.fontSize(10).fillColor('#6b7280').text('No medicines prescribed.');
    } else {
      const medY = doc.y;
      doc.fontSize(10).fillColor('#1f2937');
      doc.text('Medicine Name', 50, medY, { width: 180, bold: true });
      doc.text('Dosage', 230, medY, { width: 100 });
      doc.text('Frequency', 330, medY, { width: 110 });
      doc.text('Duration', 440, medY, { width: 100 });

      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke();
      doc.moveDown(0.5);

      for (const item of items) {
        const rowY = doc.y;
        doc.text(item.medicine_name, 50, rowY, { width: 180 });
        doc.text(item.dosage, 230, rowY, { width: 100 });
        doc.text(item.frequency, 330, rowY, { width: 110 });
        doc.text(item.duration, 440, rowY, { width: 100 });
        doc.moveDown(0.8);
      }
    }

    // --- Footer Signature ---
    doc.moveDown(4);
    const sigY = doc.y;
    doc.moveTo(350, sigY).lineTo(520, sigY).strokeColor('#9ca3af').lineWidth(1).stroke();
    doc.fontSize(10).text('Authorized Signature / Stamp', 360, sigY + 5);

    doc.end();
  } catch (error) {
    next(error);
  }
};
