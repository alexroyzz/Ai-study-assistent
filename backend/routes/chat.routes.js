// routes/chat.routes.js
const express = require('express');
const { sendMessage, getChats, getChatHistory, deleteChat } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect);
router.get('/', getChats);
router.post('/message', sendMessage);
router.get('/:id', getChatHistory);
router.delete('/:id', deleteChat);

module.exports = router;
