const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getDialogs, markAsRead } = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/dialogs', authMiddleware, getDialogs);
router.get('/:userId', authMiddleware, getMessages);
router.post('/', authMiddleware, sendMessage);
//router.put('/:messageId/read', authMiddleware, markAsRead);

module.exports = router;
