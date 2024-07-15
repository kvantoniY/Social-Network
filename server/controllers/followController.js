const Follow = require('../models/Follow');
const User = require('../models/User');
const { Op } = require('sequelize');

exports.followUser = async (req, res) => {
    try {
        const userToFollow = await User.findByPk(req.params.userId);
        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }
        const follow = await Follow.create({ followerId: req.userId, followingId: req.params.userId });
        const user = await User.findByPk(req.params.userId);
        const followers = await user.getFollowers();
        res.status(200).json(followers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const follow = await Follow.findOne({ where: { followerId: req.userId, followingId: req.params.userId } });
        if (!follow) {
            return res.status(404).json({ message: 'Follow not found' });
        }
        await follow.destroy();

        const user = await User.findByPk(req.params.userId);
        const followers = await user.getFollowers();
        console.log(followers)
        res.status(200).json(followers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFollowers = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(userId)
        const user = await User.findByPk(req.body.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const followers = await user.getFollowers();
        res.status(200).json(followers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const user = await User.findByPk(req.body.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const following = await user.getFollowings();
        res.status(200).json(following);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchCurrentFollower = async (req, res) => {
    try {
        let status = 0;
        const follower = await Follow.findOne({where: { 
            followerId: req.params.userId,
            followingId: req.userId,
        }});
        const following = await Follow.findOne({where: { 
            followerId: req.userId,
            followingId: req.params.userId,
        }});
        if (follower && following) {
            status = 3;
        } else if (!follower && following) {
            status = 1;
        } else if (follower && !following) {
            status = 2;
        } else {
            status = 0;
        }
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchUsersByUsername = async (req, res) => {
    try {
        const { username } = req.query;
        const users = await User.findAll({
            where: {
                username: {
                    [Op.like]: `%${username}%`
                }
            }
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


