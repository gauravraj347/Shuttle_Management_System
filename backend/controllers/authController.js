const User = require("../models/User");
const Wallet = require("../models/Wallet");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "shuttlesecret123456789",
    { expiresIn: "30d" }
  );
};

const generateStudentId = async () => {
  const lastStudent = await User.findOne({ role: "student" })
    .sort({ studentId: -1 })
    .select("studentId");

  let newId;
  if (!lastStudent || !lastStudent.studentId) {
    newId = "STU001";
  } else {
    const lastNumber = parseInt(lastStudent.studentId.replace("STU", ""));
    newId = `STU${(lastNumber + 1).toString().padStart(3, "0")}`;
  }

  return newId;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    if (role === "student" || !role) {
      const isUniversityEmail = User.isUniversityEmail(email);
      if (!isUniversityEmail) {
        return res.status(400).json({
          success: false,
          message: "Please use your university email to register as a student",
        });
      }
    }

    const studentId =
      role === "student" || !role ? await generateStudentId() : "";

    var salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
      studentId,
    });

    if (user) {
      await Wallet.create({
        user: user._id,
        balance: 150,
        currency: "Points",
      });
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
        },
        token: generateToken(user._id, user.role),
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
