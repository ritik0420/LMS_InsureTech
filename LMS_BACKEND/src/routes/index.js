const { Router } = require("express");
const authRouter = require("./auth.routes");
const adminRouter = require("./admin.routes");
const studentRouter = require("./student.routes");

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: process.env.APP_NAME || "LMS Backend"
  });
});

router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/student", studentRouter);

module.exports = router;
