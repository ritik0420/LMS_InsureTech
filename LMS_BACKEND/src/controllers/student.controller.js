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

    const { fullName, phone, address, password } = req.body;

    if (fullName) student.fullName = fullName;
    if (phone !== undefined) student.phone = phone;
    if (address !== undefined) student.address = address;

    if (password) {
      student.password = await bcrypt.hash(password, 10);
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
  downloadCertificate
};
