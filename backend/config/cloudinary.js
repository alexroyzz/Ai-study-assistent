const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary with credentials from environment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for PDFs
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ai-study-assistant/pdfs", // Folder name in Cloudinary
    allowed_formats: ["pdf"],
    resource_type: "raw", // PDFs must be uploaded as 'raw' type
    // Generate unique public_id for each file
    public_id: (req, file) => {
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
      const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, "_");
      return `${cleanName}_${timestamp}`;
    },
  },
});

// Multer file filter - only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// Create multer upload middleware with 10MB limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = { cloudinary, upload };
