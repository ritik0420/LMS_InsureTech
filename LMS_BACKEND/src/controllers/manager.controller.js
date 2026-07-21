const User = require("../models/user.model");

const listAssignedStudents = async (req, res) => {
  try {
    const manager = await User.findById(req.user._id).populate({
      path: "assignedStudents",
      select: "-password",
      options: { sort: { createdAt: -1 } }
    });

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    return res.status(200).json({ students: manager.assignedStudents || [] });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch assigned students",
      error: error.message
    });
  }
};

const getAssignedStudent = async (req, res) => {
  try {
    const manager = await User.findById(req.user._id);

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const isAssigned = manager.assignedStudents.some(
      (sid) => sid.toString() === req.params.id
    );

    if (!isAssigned) {
      return res.status(403).json({ message: "Student is not assigned to you" });
    }

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

const validateAssignment = async (managerId, studentId) => {
  const manager = await User.findById(managerId);
  if (!manager) return { error: "Manager not found", status: 404 };

  const isAssigned = manager.assignedStudents.some(
    (sid) => sid.toString() === studentId
  );
  if (!isAssigned) return { error: "Student is not assigned to you", status: 403 };

  const student = await User.findOne({ _id: studentId, role: "STUDENT" });
  if (!student) return { error: "Student not found", status: 404 };

  return { student };
};

const downloadStudentResume = async (req, res) => {
  try {
    const result = await validateAssignment(req.user._id, req.params.id);
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    const { student } = result;

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

const downloadStudentCertificate = async (req, res) => {
  try {
    const result = await validateAssignment(req.user._id, req.params.id);
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    const { student } = result;

    const certificate = student.certificates.id(req.params.certificateId);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const fs = require("fs");
    if (!fs.existsSync(certificate.path)) {
      return res.status(404).json({ message: "Certificate file not found on disk" });
    }

    return res.download(
      certificate.path,
      certificate.originalName || certificate.filename
    );
  } catch (error) {
    return res.status(500).json({
      message: "Failed to download student certificate",
      error: error.message
    });
  }
};

const downloadStudentDocument = async (req, res) => {
  try {
    const result = await validateAssignment(req.user._id, req.params.id);
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    const { student } = result;

    const document = student.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const fs = require("fs");
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({ message: "Document file not found on disk" });
    }

    return res.download(
      document.path,
      document.originalName || document.filename
    );
  } catch (error) {
    return res.status(500).json({
      message: "Failed to download student document",
      error: error.message
    });
  }
};

module.exports = {
  listAssignedStudents,
  getAssignedStudent,
  downloadStudentResume,
  downloadStudentCertificate,
  downloadStudentDocument
};
