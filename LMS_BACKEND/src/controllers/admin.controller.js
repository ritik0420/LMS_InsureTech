const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

const createStudent = async (req, res) => {
  try {
    const { fullName, email, password, phone, address } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email, and password are required"
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "STUDENT",
      phone: phone || "",
      address: address || ""
    });

    return res.status(201).json({
      message: "Student created successfully",
      student: student.toPublicJSON()
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create student",
      error: error.message
    });
  }
};

const listStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "STUDENT" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({ students });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch students",
      error: error.message
    });
  }
};

const getStudent = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: "STUDENT"
    }).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ student });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch student",
      error: error.message
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: "STUDENT"
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const {
      fullName,
      email,
      phone,
      address,
      isActive,
      password,
      currentStatusCityState,
      visaStatus,
      visaExpiryDate,
      totalExperience,
      preferredDesignation,
      preferredLocations,
      dateOfBirth,
      openToRelocation,
      expectedSalary,
      preferredJobType,
      expectedSalaryPeriod,
      securityClearance
    } = req.body;

    if (fullName) student.fullName = fullName;
    if (phone !== undefined) student.phone = phone;
    if (address !== undefined) student.address = address;
    if (isActive !== undefined) student.isActive = isActive;

    if (currentStatusCityState !== undefined) student.currentStatusCityState = currentStatusCityState;
    if (visaStatus !== undefined) student.visaStatus = visaStatus;
    if (visaExpiryDate !== undefined) {
      student.visaExpiryDate = visaExpiryDate ? new Date(visaExpiryDate) : null;
    }
    if (totalExperience !== undefined) student.totalExperience = totalExperience;
    if (preferredDesignation !== undefined) student.preferredDesignation = preferredDesignation;
    if (preferredLocations !== undefined) student.preferredLocations = preferredLocations;
    if (dateOfBirth !== undefined) {
      student.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    if (openToRelocation !== undefined) student.openToRelocation = openToRelocation;
    if (expectedSalary !== undefined) student.expectedSalary = expectedSalary;
    if (expectedSalaryPeriod !== undefined) student.expectedSalaryPeriod = expectedSalaryPeriod;
    if (securityClearance !== undefined) student.securityClearance = securityClearance;

    if (preferredJobType !== undefined) {
      if (Array.isArray(preferredJobType)) {
        student.preferredJobType = preferredJobType;
      } else {
        try {
          const parsed = JSON.parse(preferredJobType);
          student.preferredJobType = Array.isArray(parsed) ? parsed : [preferredJobType];
        } catch (e) {
          student.preferredJobType = preferredJobType.split(",").map(s => s.trim()).filter(Boolean);
        }
      }
    }

    if (email && email !== student.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: "Email already in use" });
      }
      student.email = email;
    }

    if (password) {
      student.password = await bcrypt.hash(password, 10);
    }

    await student.save();

    const updated = await User.findById(student._id).select("-password");

    return res.status(200).json({
      message: "Student updated successfully",
      student: updated
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update student",
      error: error.message
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: "STUDENT"
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.isActive = false;
    await student.save();

    return res.status(200).json({ message: "Student deactivated successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to deactivate student",
      error: error.message
    });
  }
};

const deleteStudentPermanently = async (req, res) => {
  try {
    const deletedStudent = await User.findOneAndDelete({
      _id: req.params.id,
      role: "STUDENT"
    });

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ message: "Student deleted permanently" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete student permanently",
      error: error.message
    });
  }
};

const uploadCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Certificate file is required" });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Certificate title is required" });
    }

    const student = await User.findOne({
      _id: req.params.id,
      role: "STUDENT"
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.certificates.push({
      title,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: req.user._id
    });

    await student.save();

    const certificate = student.certificates[student.certificates.length - 1];

    return res.status(201).json({
      message: "Certificate uploaded successfully",
      certificate
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to upload certificate",
      error: error.message
    });
  }
};

const downloadStudentResume = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: "STUDENT"
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.resumeFile || !student.resumeFile.path) {
      return res.status(404).json({ message: "Resume file not found" });
    }

    const fs = require("fs");
    if (!fs.existsSync(student.resumeFile.path)) {
      return res.status(404).json({ message: "Resume file not found on disk" });
    }

    return res.download(
      student.resumeFile.path,
      student.resumeFile.originalName || student.resumeFile.filename
    );
  } catch (error) {
    return res.status(500).json({
      message: "Failed to download student resume",
      error: error.message
    });
  }
};

module.exports = {
  createStudent,
  listStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  deleteStudentPermanently,
  uploadCertificate,
  downloadStudentResume
};
