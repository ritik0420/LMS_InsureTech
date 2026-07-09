const { Router } = require("express");
const { adminLogin, studentLogin, registerStudent } = require("../controllers/auth.controller");

const authRouter = Router();

const methodNotAllowed = (req, res) => {
  res.status(405).json({
    message: "Method not allowed",
    details: "Use POST to create a student account.",
  });
};

authRouter.route("/signup")
  .post(registerStudent)
  .all(methodNotAllowed);

authRouter.route("/student/signup")
  .post(registerStudent)
  .all(methodNotAllowed);
authRouter.post("/admin/login", adminLogin);
authRouter.post("/student/login", studentLogin);

module.exports = authRouter;
