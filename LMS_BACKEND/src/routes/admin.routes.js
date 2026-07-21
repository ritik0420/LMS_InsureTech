const { Router } = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const {
  uploadCertificate,
  handleUploadError
} = require("../middlewares/upload.middleware");
const {
  createStudent,
  listStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  deleteStudentPermanently,
  uploadCertificate: uploadCertificateHandler,
  downloadStudentResume,
  downloadStudentCertificate,
  downloadStudentDocument,
  listManagers,
  createManager,
  getManager,
  assignStudentToManager,
  unassignStudentFromManager
} = require("../controllers/admin.controller");

const adminRouter = Router();

adminRouter.use(authenticate, authorize("ADMIN"));

adminRouter.post("/students", createStudent);
adminRouter.get("/students", listStudents);
adminRouter.get("/students/:id", getStudent);
adminRouter.put("/students/:id", updateStudent);
adminRouter.delete("/students/:id", deleteStudent);
adminRouter.delete("/students/:id/permanent", deleteStudentPermanently);
adminRouter.get("/students/:id/resume/download", downloadStudentResume);
adminRouter.get(
  "/students/:id/certificates/:certificateId/download",
  downloadStudentCertificate
);
adminRouter.get(
  "/students/:id/documents/:documentId/download",
  downloadStudentDocument
);
adminRouter.post(
  "/students/:id/certificates",
  uploadCertificate.single("certificate"),
  handleUploadError,
  uploadCertificateHandler
);

adminRouter.get("/managers", listManagers);
adminRouter.post("/managers", createManager);
adminRouter.get("/managers/:id", getManager);
adminRouter.post("/managers/:managerId/assign/:studentId", assignStudentToManager);
adminRouter.delete("/managers/:managerId/assign/:studentId", unassignStudentFromManager);

module.exports = adminRouter;

