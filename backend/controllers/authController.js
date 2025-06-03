const User = require('../models/User');
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },  // Include role in the token payload
    process.env.JWT_SECRET || 'shuttlesecret123456789',
    { expiresIn: '30d' }
  );
};

// Generate student ID
const generateStudentId = async () => {
  // Find the last student
  const lastStudent = await User.findOne({ role: 'student' })
    .sort({ studentId: -1 })
    .select('studentId');

  let newId;
  if (!lastStudent || !lastStudent.studentId) {
    // If no students exist, start with STU001
    newId = 'STU001';
  } else {
    // Extract the number and increment
    const lastNumber = parseInt(lastStudent.studentId.replace('STU', ''));
    newId = `STU${(lastNumber + 1).toString().padStart(3, '0')}`;
  }

  return newId;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Check if it's a university email for student role
    if (role === 'student' || !role) {
      const isUniversityEmail = User.isUniversityEmail(email);
      if (!isUniversityEmail) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please use your university email to register as a student' 
        });
      }
    }

    // Generate student ID for students
    const studentId = (role === 'student' || !role) ? await generateStudentId() : '';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      studentId
    });

    if (user) {
      // Create a wallet for the user
      await Wallet.create({
        user: user._id,
        balance: 500,
        currency: 'Points'
      });
      
      // TODO: Send verification email (not implemented in this version)
      
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          isEmailVerified: user.isEmailVerified
        },
        token: generateToken(user._id, user.role),
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 