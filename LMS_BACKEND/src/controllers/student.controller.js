const bcrypt = require("bcryptjs");
const fs = require("fs");
const User = require("../models/user.model");

const getProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select("-password");
    return res.status(200).json({ student });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);

    const {
      fullName,
      phone,
      address,
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
    if (password) {
      student.password = await bcrypt.hash(password, 10);
    }

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

    await student.save();

    const updated = await User.findById(student._id).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      student: updated
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update profile",
      error: error.message
    });
  }
};

const onboardStudent = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const {
      fullName,
      phone,
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
    if (phone) student.phone = phone;
    if (currentStatusCityState) {
      student.currentStatusCityState = currentStatusCityState;
      student.address = currentStatusCityState;
    }
    if (visaStatus) student.visaStatus = visaStatus;
    if (visaExpiryDate) {
      student.visaExpiryDate = visaExpiryDate ? new Date(visaExpiryDate) : null;
    }
    if (totalExperience) student.totalExperience = totalExperience;
    if (preferredDesignation) student.preferredDesignation = preferredDesignation;
    if (preferredLocations) student.preferredLocations = preferredLocations;
    if (dateOfBirth) {
      student.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    if (openToRelocation) student.openToRelocation = openToRelocation;
    if (expectedSalary) student.expectedSalary = expectedSalary;
    if (expectedSalaryPeriod) student.expectedSalaryPeriod = expectedSalaryPeriod;
    if (securityClearance) student.securityClearance = securityClearance;

    if (preferredJobType) {
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

    student.resumeFile = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    };

    student.isOnboarded = true;

    await student.save();

    const updated = await User.findById(student._id).select("-password");

    return res.status(200).json({
      message: "Student onboarding completed successfully",
      student: updated
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to complete onboarding",
      error: error.message
    });
  }
};

const downloadResume = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    if (!student || !student.resumeFile || !student.resumeFile.path) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (!fs.existsSync(student.resumeFile.path)) {
      return res.status(404).json({ message: "Resume file not found on disk" });
    }

    return res.download(
      student.resumeFile.path,
      student.resumeFile.originalName || student.resumeFile.filename
    );
  } catch (error) {
    return res.status(500).json({
      message: "Failed to download resume",
      error: error.message
    });
  }
};

const updateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.resumeFile && student.resumeFile.path && fs.existsSync(student.resumeFile.path)) {
      try {
        fs.unlinkSync(student.resumeFile.path);
      } catch (err) {
        console.error("Failed to delete old resume:", err);
      }
    }

    student.resumeFile = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    };

    await student.save();

    return res.status(200).json({
      message: "Resume updated successfully",
      resumeFile: student.resumeFile
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update resume",
      error: error.message
    });
  }
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Document file is required" });
    }

    const student = await User.findById(req.user._id);

    student.documents.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    await student.save();

    const document = student.documents[student.documents.length - 1];

    return res.status(201).json({
      message: "Document uploaded successfully",
      document
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to upload document",
      error: error.message
    });
  }
};

const listDocuments = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select("documents");
    return res.status(200).json({ documents: student.documents });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch documents",
      error: error.message
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const document = student.documents.id(req.params.documentId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    document.deleteOne();
    await student.save();

    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete document",
      error: error.message
    });
  }
};

const listCertificates = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select("certificates");
    return res.status(200).json({ certificates: student.certificates });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch certificates",
      error: error.message
    });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const certificate = student.certificates.id(req.params.certificateId);

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    if (!fs.existsSync(certificate.path)) {
      return res.status(404).json({ message: "Certificate file not found" });
    }

    return res.download(
      certificate.path,
      certificate.originalName || certificate.filename
    );
  } catch (error) {
    return res.status(500).json({
      message: "Failed to download certificate",
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadDocument,
  listDocuments,
  deleteDocument,
  listCertificates,
  downloadCertificate,
  onboardStudent,
  downloadResume,
  updateResume
};
