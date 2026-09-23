const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password-otp', authController.forgotPasswordOtp);
router.post('/reset-credentials', authController.resetCredentialsWithOtp);

// Admin 2FA & JWT Auth
router.post('/admin/login-step1', authController.adminLoginStep1);
router.post('/admin/login-step2', authController.adminLoginStep2);
router.post('/admin/refresh', authController.adminRefreshToken);

module.exports = router;

