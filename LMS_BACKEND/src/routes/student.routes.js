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
  downloadCertificate
} = require("../controllers/student.controller");

const studentRouter = Router();

studentRouter.use(authenticate, authorize("STUDENT"));

studentRouter.get("/profile", getProfile);
studentRouter.put("/profile", updateProfile);

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

module.exports = studentRouter;
