const express = require('express');
const router = express.Router();
const vaController = require('../controllers/vaController');
const { authenticate, optionalAuthenticate } = require('../middleware/authMiddleware');

router.post('/', optionalAuthenticate, vaController.saveVATest);
router.get('/', authenticate, vaController.getVAHistory);

module.exports = router;
