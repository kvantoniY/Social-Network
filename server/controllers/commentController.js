const Comment = require('../models/Comment');
const LikeCom = require('../models/LikeCom');
const Post = require('../models/Post');
const User = require('../models/User');

exports.fetchComments = async (req, res) => {
    try {
        const postId = req.params.postId;
        const comments = await Comment.findAll({
            where: {postId: postId},
        });
      
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

exports.addLike = async (req, res) => {
  try {
    const checkLike = await LikeCom.findOne({
      where: { commentId: req.params.commentId, userId: req.userId },
    });
    const findComment = await Comment.findOne({
        where: { id: req.params.commentId, userId: req.userId },
      });

    const postId = findComment.postId;

    if (checkLike) {
      return res.status(404).json({ message: "Лайк уже стоит" });
    }
    const addLike = await LikeCom.create({
      commentId: req.params.commentId,
      userId: req.userId,
    });

    const commentId = req.params.commentId;
    // Найдите пользователя, чтобы вернуть его вместе с комментарием
    const user = await User.findByPk(req.userId);
    const newLike = await LikeCom.findOne({
        where: { commentId: req.params.commentId, userId: req.userId },
      });
      console.log(`NEW LIKE: ${newLike}`)
    const like = {
      ...addLike.dataValues,
      User: user, // Добавьте пользователя к комментарию
      LikeCom: newLike
    };

    console.log(like, commentId, postId)
    res.status(201).json({ like, commentId, postId});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeLike = async (req, res) => {
  try {
    const like = await LikeCom.findOne({
      where: { commentId: req.params.commentId, userId: req.userId },
    });
    if (!like) {
      return res.status(404).json({ message: "LikeCom not found" });
    }
    const findComment = await Comment.findOne({
        where: { id: req.params.commentId, userId: req.userId },
      });
    
    const postId = findComment.postId;
    
    await like.destroy();
    const commentId = req.params.commentId;
    const userId = req.userId;
    res.status(200).json({ like, commentId, userId, postId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.fetchLikes = async (req, res) => {
  try {
    const allLikes = await LikeCom.findAll({
      where: { commentId: req.params.commentId },
    });
    const like = await LikeCom.findOne({
      where: { commentId: req.params.commentId, userId: req.userId },
    });
    let myLikeStatus = false;
    if (like) {
      myLikeStatus = true;
    } else {
      myLikeStatus = false;
    }
    const commentId = req.params.commentId;
    res.status(200).json({ myLikeStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
