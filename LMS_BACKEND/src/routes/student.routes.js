const { Router } = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const {
  uploadDocument,
  handleUploadError
} = require("../middlewares/upload.middleware");
const {
  getProfile,
  updateProfile,
  uploadDocument: uploadDocumentHandler,
  listDocuments,
  deleteDocument,
  listCertificates,
  downloadCertificate,
  onboardStudent,
  downloadResume,
  updateResume,
  updateResume2,
  updateCoverLetter,
  downloadResume2,
  downloadCoverLetter,
  listClassLinks,
  listInvoices
} = require("../controllers/student.controller");

const studentRouter = Router();

studentRouter.use(authenticate, authorize("STUDENT"));

studentRouter.get("/profile", getProfile);
studentRouter.put("/profile", updateProfile);
studentRouter.put(
  "/profile/resume",
  uploadDocument.single("resume"),
  handleUploadError,
  updateResume
);

studentRouter.put(
  "/profile/resume2",
  uploadDocument.single("resume2"),
  handleUploadError,
  updateResume2
);

studentRouter.put(
  "/profile/cover-letter",
  uploadDocument.single("coverLetter"),
  handleUploadError,
  updateCoverLetter
);

studentRouter.post(
  "/onboard",
  uploadDocument.fields([
    { name: "resume", maxCount: 1 },
    { name: "resume2", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 }
  ]),
  handleUploadError,
  onboardStudent
);

studentRouter.get("/resume/download", downloadResume);
studentRouter.get("/resume2/download", downloadResume2);
studentRouter.get("/cover-letter/download", downloadCoverLetter);

studentRouter.get("/documents", listDocuments);
studentRouter.post(
  "/documents",
  uploadDocument.single("document"),
  handleUploadError,
  uploadDocumentHandler
);
studentRouter.delete("/documents/:documentId", deleteDocument);

studentRouter.get("/certificates", listCertificates);
studentRouter.get("/certificates/:certificateId/download", downloadCertificate);

studentRouter.get("/class-links", listClassLinks);

studentRouter.get("/invoices", listInvoices);

module.exports = studentRouter;
