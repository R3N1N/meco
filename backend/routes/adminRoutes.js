const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Lock down all routes below to authenticate + admin role
router.use(authenticate, authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.toggleUserStatus);

router.post('/doctors', adminController.addDoctor);
router.put('/doctors/:id', adminController.editDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);

router.get('/reports', adminController.getReports);
router.get('/contacts', adminController.getContacts);

module.exports = router;
