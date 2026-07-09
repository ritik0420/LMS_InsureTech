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
  uploadCertificate: uploadCertificateHandler
} = require("../controllers/admin.controller");

const adminRouter = Router();

adminRouter.use(authenticate, authorize("ADMIN"));

adminRouter.post("/students", createStudent);
adminRouter.get("/students", listStudents);
adminRouter.get("/students/:id", getStudent);
adminRouter.put("/students/:id", updateStudent);
adminRouter.delete("/students/:id", deleteStudent);
adminRouter.delete("/students/:id/permanent", deleteStudentPermanently);
adminRouter.post(
  "/students/:id/certificates",
  uploadCertificate.single("certificate"),
  handleUploadError,
  uploadCertificateHandler
);

module.exports = adminRouter;
