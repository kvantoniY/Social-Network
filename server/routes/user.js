const express = require('express');
const router = express.Router();
const { getUserById, getAllUsers, searchUsers, searchUsersByUsername, getUserByUsername, editUser, editUserAvatar, blackListUsers, addBlackListUser, deleteBlackListUser, allBlackListUsers, myBlackListUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/search', authMiddleware, searchUsers);
router.get('/checkBlackList/:userId', authMiddleware, blackListUsers);
router.post('/addBlackList/:userId', authMiddleware, addBlackListUser);
router.delete('/deleteBlackList/:userId', authMiddleware, deleteBlackListUser);
router.get('/allBlackList', authMiddleware, allBlackListUsers);
router.get('/myBlackListUsers', authMiddleware, myBlackListUsers);
router.put('/', authMiddleware, editUser);
router.put('/editUserAvatar', authMiddleware, editUserAvatar);
router.post('/', getUserByUsername);
router.get('/:userId', getUserById);
router.get('/', getAllUsers);


module.exports = router;
