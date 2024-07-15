const express = require('express');
const router = express.Router();
const { addLike, removeLike, fetchLikes } = require('../controllers/likeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:postId', authMiddleware, fetchLikes);
router.post('/:postId', authMiddleware, addLike);
router.delete('/:postId', authMiddleware, removeLike);


module.exports = router;
