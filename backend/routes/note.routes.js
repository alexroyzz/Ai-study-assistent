// routes/note.routes.js
const express = require('express');
const { generateNote, getNotes, getNote, deleteNote } = require('../controllers/note.controller');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect);
router.get('/', getNotes);
router.post('/generate', generateNote);
router.get('/:id', getNote);
router.delete('/:id', deleteNote);

module.exports = router;
