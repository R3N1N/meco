const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let dbType = process.env.DB_TYPE || 'mysql';
const useSqliteFallback = process.env.USE_SQLITE_FALLBACK === 'true';

let mysqlPool = null;
let sqliteDb = null;

// Unified database query function
async function query(sql, params = []) {
  if (dbType === 'mysql') {
    try {
      const [rows, fields] = await mysqlPool.query(sql, params);
      return [rows, fields];
    } catch (error) {
      console.error('MySQL Query Error:', error);
      throw error;
    }
  } else {
    // SQLite query execution wrapper
    return new Promise((resolve, reject) => {
      const isMutating = /^\s*(insert|update|delete)/i.test(sql);

      // Convert standard placeholder '?' mapping (SQLite handles ? out-of-the-box)
      if (isMutating) {
        sqliteDb.run(sql, params, function (err) {
          if (err) {
            console.error('SQLite Run Error:', err, 'SQL:', sql);
            reject(err);
          } else {
            resolve([{ insertId: this.lastID, affectedRows: this.changes }, null]);
          }
        });
      } else {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) {
            console.error('SQLite All Error:', err, 'SQL:', sql);
            reject(err);
          } else {
            resolve([rows, null]);
          }
        });
      }
    });
  }
}

// Helper to wrap transactions
async function transaction(callback) {
  if (dbType === 'mysql') {
    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } else {
    // SQLite transaction execution
    return new Promise((resolve, reject) => {
      sqliteDb.serialize(async () => {
        sqliteDb.run('BEGIN TRANSACTION', async (err) => {
          if (err) return reject(err);
          try {
            // SQLite runs operations sequentially in serialize mode.
            // We pass an object with .query executing on the main SQLite database.
            const connectionMock = {
              query: async (sql, params) => {
                return new Promise((res, rej) => {
                  const isMutating = /^\s*(insert|update|delete)/i.test(sql);
                  if (isMutating) {
                    sqliteDb.run(sql, params, function (e) {
                      if (e) rej(e);
                      else res([{ insertId: this.lastID, affectedRows: this.changes }, null]);
                    });
                  } else {
                    sqliteDb.all(sql, params, (e, rows) => {
                      if (e) rej(e);
                      else res([rows, null]);
                    });
                  }
                });
              }
            };
            const result = await callback(connectionMock);
            sqliteDb.run('COMMIT', (commitErr) => {
              if (commitErr) reject(commitErr);
              else resolve(result);
            });
          } catch (execErr) {
            sqliteDb.run('ROLLBACK', () => {
              reject(execErr);
            });
          }
        });
      });
    });
  }
}

// Convert schema creation scripts to SQLite syntax if database is SQLite
function adaptSql(sql) {
  if (dbType === 'mysql') return sql;

  let sqliteSql = sql
    .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/INT/g, 'INTEGER')
    .replace(/DECIMAL\(\d+,\s*\d+\)/g, 'REAL')
    .replace(/ENUM\([^)]+\)/gi, 'TEXT')
    .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
    .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
    .replace(/BOOLEAN DEFAULT FALSE/gi, 'INTEGER DEFAULT 0')
    .replace(/BOOLEAN DEFAULT TRUE/gi, 'INTEGER DEFAULT 1')
    .replace(/FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s*(\w+)\s*\(([^)]+)\)\s*ON DELETE SET NULL/gi, 'FOREIGN KEY ($1) REFERENCES $2($3) ON DELETE SET NULL')
    .replace(/FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s*(\w+)\s*\(([^)]+)\)\s*ON DELETE CASCADE/gi, 'FOREIGN KEY ($1) REFERENCES $2($3) ON DELETE CASCADE');

  return sqliteSql;
}

// Initialize Database Connection and Tables
async function initDb() {
  console.log(`Configuring database connection... Specified type: ${dbType}`);

  let connected = false;

  if (dbType === 'mysql' && !useSqliteFallback) {
    try {
      mysqlPool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'eyecare_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test MySQL connection
      const conn = await mysqlPool.getConnection();
      console.log('Successfully connected to MySQL database.');
      conn.release();
      connected = true;
    } catch (err) {
      console.warn('MySQL connection failed. Error:', err.message);
      console.warn('Falling back to local SQLite database...');
      dbType = 'sqlite';
    }
  } else {
    console.log('Using SQLite database as requested or as fallback.');
    dbType = 'sqlite';
  }

  if (dbType === 'sqlite') {
    const dbPath = path.join(__dirname, '..', 'eyecare.sqlite');
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to open SQLite database:', err);
        process.exit(1);
      }
      console.log(`SQLite database file opened/created at: ${dbPath}`);
    });
    // Enable foreign keys in SQLite
    sqliteDb.run('PRAGMA foreign_keys = ON;');
    connected = true;
  }

  // Define table schemas
  const tableSchemas = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('patient', 'doctor', 'admin') NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS doctors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNIQUE NOT NULL,
      specialization VARCHAR(150) NOT NULL,
      experience_years INT DEFAULT 0,
      biography TEXT,
      consultation_fee DECIMAL(10, 2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS doctor_schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      doctor_id INT NOT NULL,
      day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
      start_time VARCHAR(20) NOT NULL,
      end_time VARCHAR(20) NOT NULL,
      slot_duration INT DEFAULT 15,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT,
      guest_name VARCHAR(100),
      guest_email VARCHAR(100),
      guest_phone VARCHAR(20),
      doctor_id INT,
      appointment_type ENUM('clinic', 'home') NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time VARCHAR(20) NOT NULL,
      status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
      address TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      notes TEXT,
      cost_price DECIMAL(10, 2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
    )`,

    `CREATE TABLE IF NOT EXISTS appointment_slots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      doctor_id INT NOT NULL,
      slot_date DATE NOT NULL,
      start_time VARCHAR(20) NOT NULL,
      end_time VARCHAR(20) NOT NULL,
      is_booked BOOLEAN DEFAULT FALSE,
      appointment_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
    )`,

    `CREATE TABLE IF NOT EXISTS prescriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      appointment_id INT UNIQUE,
      patient_id INT,
      doctor_id INT NOT NULL,
      diagnosis TEXT NOT NULL,
      notes TEXT,
      sph_od DECIMAL(4, 2),
      cyl_od DECIMAL(4, 2),
      axis_od INT,
      sph_os DECIMAL(4, 2),
      cyl_os DECIMAL(4, 2),
      axis_os INT,
      va_unaided_od VARCHAR(20),
      va_aided_od VARCHAR(20),
      va_unaided_os VARCHAR(20),
      va_aided_os VARCHAR(20),
      pd DECIMAL(4, 1),
      add_power DECIMAL(4, 2),
      add_od DECIMAL(4, 2),
      add_os DECIMAL(4, 2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS prescription_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      prescription_id INT NOT NULL,
      medicine_name VARCHAR(150) NOT NULL,
      dosage VARCHAR(50) NOT NULL,
      frequency VARCHAR(100) NOT NULL,
      duration VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS va_tests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      guest_name VARCHAR(100),
      right_eye_va VARCHAR(10) NOT NULL,
      left_eye_va VARCHAR(10) NOT NULL,
      interpretation TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  // Run schema creation
  for (const schema of tableSchemas) {
    const adapted = adaptSql(schema);
    await query(adapted);
  }

  // Migration to add cost_price to appointments if it doesn't exist
  try {
    if (dbType === 'mysql') {
      await query("ALTER TABLE appointments ADD COLUMN cost_price DECIMAL(10,2) DEFAULT 0.00");
    } else {
      await query("ALTER TABLE appointments ADD COLUMN cost_price REAL DEFAULT 0.00");
    }
    console.log('Added cost_price column to appointments table.');

    // Backfill existing clinic appointments
    await query(`
      UPDATE appointments
      SET cost_price = (
        SELECT consultation_fee 
        FROM doctors 
        WHERE doctors.id = appointments.doctor_id
      )
      WHERE appointment_type = 'clinic' AND (cost_price IS NULL OR cost_price = 0)
    `);

    // Backfill existing home appointments
    await query(`
      UPDATE appointments
      SET cost_price = 500.00
      WHERE appointment_type = 'home' AND (cost_price IS NULL OR cost_price = 0)
    `);
    console.log('Successfully backfilled cost_price for existing appointments.');
  } catch (err) {
    // Column already exists or error, ignore/handle gracefully
  }

  console.log('Database tables verified/created successfully.');

  // Seed database
  await seedDatabase();
}

async function seedDatabase() {
  try {
    // Check if admin user exists
    const [users] = await query('SELECT * FROM users WHERE email = ?', ['admin@eyecare.com']);
    if (users.length === 0) {
      console.log('Seeding initial system users...');

      const adminPass = await bcrypt.hash('admin123', 10);
      const docPass = await bcrypt.hash('doctor123', 10);
      const patientPass = await bcrypt.hash('patient123', 10);

      // 1. Seed Admin
      const [adminResult] = await query(
        'INSERT INTO users (name, email, password, role, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['System Admin', 'admin@eyecare.com', adminPass, 'admin', '555-0100', '123 EyeCare HQ, Vision City', 'active']
      );

      // 2. Seed Doctor
      const [docUserResult] = await query(
        'INSERT INTO users (name, email, password, role, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Dr. Sarah Miller', 'doctor@eyecare.com', docPass, 'doctor', '555-0101', 'Clinic Suite 4A, Medical Center', 'active']
      );
      const docUserId = docUserResult.insertId;

      // Create Doctor details
      const [docProfileResult] = await query(
        'INSERT INTO doctors (user_id, specialization, experience_years, biography, consultation_fee) VALUES (?, ?, ?, ?, ?)',
        [docUserId, 'Optometrist & Contact Lens Specialist', 12, 'Dr. Sarah Miller has over 12 years of experience providing comprehensive eye exams, fitting specialty contact lenses, and managing dry eye diseases.', 75.00]
      );
      const doctorId = docProfileResult.insertId;

      // Seed another doctor for admin dashboards to feel populated
      const doc2Pass = await bcrypt.hash('doctor123', 10);
      const [doc2UserResult] = await query(
        'INSERT INTO users (name, email, password, role, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Dr. John Watson', 'doctor2@eyecare.com', doc2Pass, 'doctor', '555-0103', 'Clinic Suite 4B, Medical Center', 'active']
      );
      const doc2UserId = doc2UserResult.insertId;
      await query(
        'INSERT INTO doctors (user_id, specialization, experience_years, biography, consultation_fee) VALUES (?, ?, ?, ?, ?)',
        [doc2UserId, 'Ophthalmologist & Eye Surgeon', 15, 'Dr. John Watson specializes in advanced cataract surgery and glaucoma treatments.', 120.00]
      );

      // 3. Seed Patient
      await query(
        'INSERT INTO users (name, email, password, role, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Mark Davis', 'patient@eyecare.com', patientPass, 'patient', '555-0102', '742 Evergreen Terrace, Springfield', 'active']
      );

      // 4. Seed doctor schedules (Sarah Miller on Mon, Wed, Fri 10:00 to 17:00)
      const weekDays = ['Monday', 'Wednesday', 'Friday'];
      for (const day of weekDays) {
        await query(
          'INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration) VALUES (?, ?, ?, ?, ?)',
          [doctorId, day, '10:00', '17:00', 15]
        );
      }

      console.log('Seeding completed successfully.');
    } else {
      console.log('Admin account found. Seeding skipped.');
    }
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

module.exports = {
  query,
  transaction,
  initDb,
  getDbType: () => dbType
};
