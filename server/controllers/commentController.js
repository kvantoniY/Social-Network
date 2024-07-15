const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Post = require('../models/Post');
const User = require('../models/User');

exports.fetchComments = async (req, res) => {
    try {
        const postId = req.params.postId;
        const comments = await Comment.findAll({where: {postId: postId}});
      
        res.status(201).json({comments, postId});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createComment = async (req, res) => {
    try {
        const { commentText } = req.body;
        const post = await Post.findByPk(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const addComment = await Comment.create({ content: commentText, postId: req.params.postId, userId: req.userId });
        const postId = req.params.postId;
                // Найдите пользователя, чтобы вернуть его вместе с комментарием
                const user = await User.findByPk(req.userId);

                const comment = {
                    ...addComment.dataValues,
                    User: user // Добавьте пользователя к комментарию
                };
        res.status(201).json({comment, postId});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.commentId);
        const postId = req.query.postId;
        if (!comment || (comment.userId !== req.userId && comment.postId !== postId)) {
            return res.status(403).json({ message: 'You can only delete your own comments or comments on your posts' });
        }
        await comment.destroy();
        res.status(200).json({comment, postId});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
