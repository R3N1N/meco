const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, optionalAuthenticate, authorize } = require('../middleware/authMiddleware');

router.get('/slots', appointmentController.getSlots);
router.get('/geocode', appointmentController.geocodeProxy);
router.get('/reverse-geocode', appointmentController.reverseGeocodeProxy);
router.post('/', optionalAuthenticate, appointmentController.bookAppointment);
router.get('/', authenticate, appointmentController.getAppointments);
router.put('/:id/status', authenticate, appointmentController.updateAppointmentStatus);
router.put('/:id', authenticate, authorize('admin'), appointmentController.editAppointment);

module.exports = router;
