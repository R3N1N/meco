const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const vaRoutes = require('./routes/vaRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configurations
app.use(cors());
app.use(express.json());

// API Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date(), dbType: db.getDbType() });
});

// Routing maps
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/va-tests', vaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contacts', contactRoutes);

// Unmatched route handlers
app.use((req, res, next) => {
  res.status(404).json({ message: `API Endpoint not found: ${req.method} ${req.url}` });
});

// Global error handler
app.use(errorHandler);

// Establish database connections and launch server
async function startServer() {
  try {
    // Check connection and seed database
    await db.initDb();

    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`EyeCare API Service running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Critical database initialization failure. Server aborted:', error);
    process.exit(1);
  }
}

startServer();
