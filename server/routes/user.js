const express = require('express');
const router = express.Router();
const { getUserById, getAllUsers, searchUsers, searchUsersByUsername, getUserByUsername, editUser, editUserAvatar, blackListUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/search', authMiddleware, searchUsers);
router.get('/:userId', getUserById);
router.put('/', authMiddleware, editUser)
router.put('/editUserAvatar', authMiddleware, editUserAvatar)
router.post('/', getUserByUsername);
router.post('/checkBlackList', authMiddleware, blackListUsers)
router.get('/', getAllUsers);


module.exports = router;
