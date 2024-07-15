const express = require('express');
const router = express.Router();
const { createPost, getPost, getPosts, deletePost, getUserPosts } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/getUserPosts/:userId', authMiddleware, getUserPosts);
router.get('/:postId', authMiddleware,getPost);
router.delete('/:postId', authMiddleware, deletePost);
router.get('/',authMiddleware, getPosts);
router.post('/', authMiddleware, createPost);


module.exports = router;
