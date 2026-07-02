const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/', authenticate, prescriptionController.getPrescriptions);
router.get('/:id', authenticate, prescriptionController.getPrescriptionById);
router.get('/:id/pdf', authenticate, prescriptionController.generatePDF);

router.post('/', authenticate, authorize('doctor'), prescriptionController.createPrescription);
router.put('/:id', authenticate, authorize('doctor', 'admin'), prescriptionController.updatePrescription);

module.exports = router;
