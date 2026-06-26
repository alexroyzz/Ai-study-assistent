// routes/quiz.routes.js
const express = require('express');
const { generateQuizFromDoc, submitQuiz, getQuizzes, getQuiz, deleteQuiz } = require('../controllers/quiz.controller');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect);
router.get('/', getQuizzes);
router.post('/generate', generateQuizFromDoc);
router.get('/:id', getQuiz);
router.post('/:id/submit', submitQuiz);
router.delete('/:id', deleteQuiz);

module.exports = router;
