const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const signToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const formatUserResponse = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address
});

const registerStudent = async (req, res) => {
  try {
    const { fullName, firstName, lastName, email, password, phone, address } = req.body;
    const resolvedFullName = fullName || [firstName, lastName].filter(Boolean).join(" ").trim();

    if (!resolvedFullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email, and password are required"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await User.create({
      fullName: resolvedFullName,
      email,
      password: hashedPassword,
      role: "STUDENT",
      phone: phone || "",
      address: address || ""
    });

    const token = signToken(student);

    return res.status(201).json({
      message: "Student account created successfully",
      token,
      user: formatUserResponse(student),
      student: student.toPublicJSON()
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create student account",
      error: error.message
    });
  }
};

const login = async (req, res, requiredRole) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role !== requiredRole) {
      return res.status(403).json({
        message: `Access denied. ${requiredRole} account required.`
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
};

const adminLogin = (req, res) => login(req, res, "ADMIN");
const studentLogin = (req, res) => login(req, res, "STUDENT");

module.exports = {
  adminLogin,
  studentLogin,
  registerStudent
};
