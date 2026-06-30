const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadsRoot = path.join(process.cwd(), "uploads");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(path.join(uploadsRoot, "documents"));
ensureDir(path.join(uploadsRoot, "certificates"));

const documentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(uploadsRoot, "documents"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

const certificateStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(uploadsRoot, "certificates"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `cert-${uniqueSuffix}${ext}`);
  }
});

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png"
];

const fileFilter = (_req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, and PNG files are allowed"));
  }
};

const uploadDocument = multer({
  storage: documentStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadCertificate = multer({
  storage: certificateStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size must be under 10MB" });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
};

module.exports = {
  uploadDocument,
  uploadCertificate,
  handleUploadError
};
