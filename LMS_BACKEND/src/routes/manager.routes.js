const { Router } = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const {
  listAssignedStudents,
  getAssignedStudent,
  downloadStudentResume,
  downloadStudentCertificate,
  downloadStudentDocument
} = require("../controllers/manager.controller");

const managerRouter = Router();

managerRouter.use(authenticate, authorize("MANAGER"));

managerRouter.get("/students", listAssignedStudents);
managerRouter.get("/students/:id", getAssignedStudent);
managerRouter.get("/students/:id/resume/download", downloadStudentResume);
managerRouter.get(
  "/students/:id/certificates/:certificateId/download",
  downloadStudentCertificate
);
managerRouter.get(
  "/students/:id/documents/:documentId/download",
  downloadStudentDocument
);

module.exports = managerRouter;
