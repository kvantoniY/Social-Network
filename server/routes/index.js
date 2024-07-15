const express = require('express');
const router = express.Router();

// Импортируем маршруты
const authRoutes = require('./auth');
const postRoutes = require('./post');
const commentRoutes = require('./comment');
const likeRoutes = require('./like');
const followRoutes = require('./follow');
const messageRoutes = require('./message');
const userRoutes = require('./user');

// Подключаем маршруты
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/likes', likeRoutes);
router.use('/follows', followRoutes);
router.use('/messages', messageRoutes);
router.use('/users', userRoutes);

module.exports = router;
