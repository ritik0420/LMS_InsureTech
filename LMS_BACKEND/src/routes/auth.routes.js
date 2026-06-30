const { Router } = require("express");
const { adminLogin, studentLogin } = require("../controllers/auth.controller");

const authRouter = Router();

authRouter.post("/admin/login", adminLogin);
authRouter.post("/student/login", studentLogin);

module.exports = authRouter;
