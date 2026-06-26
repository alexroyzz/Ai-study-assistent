// routes/document.routes.js
const express = require('express');
const { uploadDocument, getDocuments, getDocument, deleteDocument } = require('../controllers/document.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');
const router = express.Router();

router.use(protect);

router.get('/', getDocuments);
router.post('/upload', upload.single('pdf'), uploadDocument);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
