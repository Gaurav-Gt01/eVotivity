const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const OtpToken = require('../models/OtpToken');
const { sendOtpEmail } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'evotivity_jwt_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'evotivity_jwt_refresh_secret_2026';


exports.signup = async (req, res) => {
  try {
    const { email, username, password, fullName, nationalId, walletAddress, faceImagePath, role } = req.body;

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: email || '' },
          { username: username || '' }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or Username is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username: username || email.split('@')[0],
      password: hashedPassword,
      fullName,
      nationalId: nationalId || `NAT-${Math.floor(10000 + Math.random() * 90000)}`,
      walletAddress: walletAddress || null,
      faceImagePath: faceImagePath || null,
      role: role || 'ROLE_VOTER',
      isApproved: true
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      userId: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      walletAddress: user.walletAddress,
      role: user.role,
      isApproved: user.isApproved
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password, walletAddress } = req.body;

    // Login via MetaMask Wallet Address directly
    if (walletAddress) {
      const user = await User.findOne({
        where: {
          walletAddress: { [Op.like]: walletAddress }
        }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'No voter account registered with this MetaMask wallet address.' });
      }

      return res.json({
        success: true,
        message: 'MetaMask login successful',
        userId: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        walletAddress: user.walletAddress,
        role: user.role,
        isApproved: user.isApproved
      });
    }

    // Login via Username or Email + Password
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier || '' },
          { username: identifier || '' }
        ]
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email/username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && user.password !== password) {
      return res.status(400).json({ success: false, message: 'Invalid email/username or password' });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      userId: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      walletAddress: user.walletAddress,
      role: user.role,
      isApproved: user.isApproved
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password / Username Recovery - Request OTP
exports.forgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address.' });
    }

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    await OtpToken.create({
      email,
      electionId: 0,
      otpCode,
      expiresAt: new Date(Date.now() + 10 * 60000)
    });

    await sendOtpEmail(email, otpCode, 'EvoTivity Account Recovery OTP');

    return res.json({
      success: true,
      message: `Recovery OTP sent to ${email}`,
      otpCode // Returned for seamless UX in local/dev environment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password / Recover Credentials via OTP
exports.resetCredentialsWithOtp = async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;
    const token = await OtpToken.findOne({
      where: { email, otpCode },
      order: [['createdAt', 'DESC']]
    });

    if (!token || new Date() > token.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
    }

    token.isVerified = true;
    await token.save();

    return res.json({
      success: true,
      message: 'Credentials verified and updated successfully.',
      username: user.username,
      email: user.email
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin 2FA Login - Step 1: Validate Credentials & Issue 2FA OTP
exports.adminLoginStep1 = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminUser = await User.findOne({
      where: { email, role: 'ROLE_ADMIN' }
    });

    if (!adminUser) {
      return res.status(400).json({ success: false, message: 'Invalid Admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch && adminUser.password !== password) {
      return res.status(400).json({ success: false, message: 'Invalid Admin credentials' });
    }

    // Generate 2FA OTP code for Admin
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    await OtpToken.create({
      email: adminUser.email,
      electionId: 0,
      otpCode,
      expiresAt: new Date(Date.now() + 10 * 60000)
    });

    await sendOtpEmail(adminUser.email, otpCode, 'EvoTivity Admin 2FA Security Code');

    return res.json({
      success: true,
      message: 'Step 1 complete. 2FA OTP dispatched to admin email.',
      email: adminUser.email,
      otpCode // Included for smooth demonstration
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin 2FA Login - Step 2: Verify 2FA OTP & Return JWT Tokens
exports.adminLoginStep2 = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    const token = await OtpToken.findOne({
      where: { email, otpCode },
      order: [['createdAt', 'DESC']]
    });

    if (!token || new Date() > token.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired 2FA OTP code.' });
    }

    const adminUser = await User.findOne({ where: { email, role: 'ROLE_ADMIN' } });
    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin account not found.' });
    }

    token.isVerified = true;
    await token.save();

    // Generate JWT Access & Refresh Tokens
    const accessToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    adminUser.refreshToken = refreshToken;
    await adminUser.save();

    return res.json({
      success: true,
      message: 'Admin 2FA Authentication successful',
      accessToken,
      refreshToken,
      user: {
        id: adminUser.id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Refresh JWT Access Token
exports.adminRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh Token required.' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ success: false, message: 'Invalid Refresh Token.' });
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired Refresh Token.' });
  }
};

