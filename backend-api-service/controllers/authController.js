const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
    const { email, password, fullName, nationalId, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      email,
      password, // Note: Production apps should use bcrypt hashing
      fullName,
      nationalId,
      role: role || 'ROLE_VOTER'
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isApproved: user.isApproved
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isApproved: user.isApproved
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
