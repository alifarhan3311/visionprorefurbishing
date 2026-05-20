const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Relative to root directory where server runs
  },
  filename(req, file, cb) {
    // Unique filename: fieldname-timestamp.ext
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check file type for images
function checkImageType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|gif|svg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images Only! (jpg, jpeg, png, webp, gif, svg)');
  }
}

// Check file type for documents (used in marketing assets, etc.)
function checkDocumentType(file, cb) {
  const filetypes = /pdf|doc|docx|zip|jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Valid file types only (PDF, DOC, ZIP, Image)');
  }
}

// Generic Image Upload (Single file)
const uploadImage = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB max
  fileFilter: function (req, file, cb) {
    checkImageType(file, cb);
  },
});

// Generic Document Upload
const uploadDocument = multer({
  storage,
  limits: { fileSize: 20000000 }, // 20MB max
  fileFilter: function (req, file, cb) {
    checkDocumentType(file, cb);
  },
});

module.exports = {
  uploadImage,
  uploadDocument
};
