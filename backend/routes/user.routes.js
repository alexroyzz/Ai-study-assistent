// routes/user.routes.js
const express = require('express');
const { getProfile, updateProfile, changePassword, getUserStats } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect); // All user routes require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/stats', getUserStats);

module.exports = router;
