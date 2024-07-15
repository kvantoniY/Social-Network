const express = require('express');
const router = express.Router();
const { createComment, deleteComment, fetchComments, fetchLastComment } = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

//router.get('/fetchLastComment/:postId', authMiddleware, fetchLastComment);
router.get('/:postId', authMiddleware, fetchComments);
router.post('/:postId', authMiddleware, createComment);
router.delete('/:commentId', authMiddleware, deleteComment);

module.exports = router;
