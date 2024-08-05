const express = require('express');
const router = express.Router();
const { createComment, deleteComment, fetchComments, fetchLastComment, fetchLikes, addLike, removeLike } = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

//router.get('/fetchLastComment/:postId', authMiddleware, fetchLastComment);
router.get('/:postId', authMiddleware, fetchComments);
router.post('/:postId', authMiddleware, createComment);
router.delete('/:commentId', authMiddleware, deleteComment);
router.get('/likeComment/:commentId', authMiddleware, fetchLikes);
router.post('/likeComment/:commentId', authMiddleware, addLike);
router.delete('/likeComment/:commentId', authMiddleware, removeLike);

module.exports = router;
