const express = require('express');
const router = express.Router();
const { followUser, unfollowUser, getFollowers, getFollowing, searchUsersByUsername, searchCurrentFollower } = require('../controllers/followController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/followers/', authMiddleware, getFollowers);
router.post('/following/', authMiddleware, getFollowing);
router.post('/searchCurrentFollower/:userId', authMiddleware, searchCurrentFollower); 
router.post('/:userId', authMiddleware, followUser);
router.delete('/:userId', authMiddleware, unfollowUser);
router.post('/search', authMiddleware, searchUsersByUsername); 


module.exports = router;
