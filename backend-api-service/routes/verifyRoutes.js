const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verifyController');

router.post('/face', verifyController.verifyFace);
router.post('/send-otp', verifyController.sendOtp);
router.post('/otp', verifyController.verifyOtp);

module.exports = router;
