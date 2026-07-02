const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/', doctorController.getDoctors);
router.get('/me/schedules', authenticate, (req, res, next) => {
  req.params.id = 'me';
  next();
}, doctorController.getSchedules);
router.get('/:id/schedules', doctorController.getSchedules);

router.put('/schedules/:id', authenticate, authorize('doctor', 'admin'), doctorController.updateSchedule);
router.put('/:id', authenticate, authorize('doctor', 'admin'), doctorController.updateDoctor);
router.post('/schedules', authenticate, authorize('doctor', 'admin'), doctorController.createSchedule);
router.delete('/schedules/:id', authenticate, authorize('doctor', 'admin'), doctorController.deleteSchedule);

module.exports = router;
