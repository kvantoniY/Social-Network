const Like = require("../models/Like");
const Post = require("../models/Post");
const User = require('../models/User');

exports.addLike = async (req, res) => {
  try {
    const checkLike = await Like.findOne({
      where: { postId: req.params.postId, userId: req.userId },
    });
    if (checkLike) {
      return res.status(404).json({ message: "Лайк уже стоит" });
    }
    const addLike = await Like.create({
      postId: req.params.postId,
      userId: req.userId,
    });
    const postId = req.params.postId;
    // Найдите пользователя, чтобы вернуть его вместе с комментарием
    const user = await User.findByPk(req.userId);

    const like = {
      ...addLike.dataValues,
      User: user, // Добавьте пользователя к комментарию
    };
    res.status(201).json({ like, postId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeLike = async (req, res) => {
  try {
    const like = await Like.findOne({
      where: { postId: req.params.postId, userId: req.userId },
    });
    if (!like) {
      return res.status(404).json({ message: "Like not found" });
    }
    await like.destroy();
    const postId = req.params.postId;
    const userId = req.userId;
    res.status(200).json({ like, postId, userId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.fetchLikes = async (req, res) => {
  try {
    const allLikes = await Like.findAll({
      where: { postId: req.params.postId },
    });
    const like = await Like.findOne({
      where: { postId: req.params.postId, userId: req.userId },
    });
    let myLikeStatus = false;
    if (like) {
      myLikeStatus = true;
    } else {
      myLikeStatus = false;
    }
    const postId = req.params.postId;
    res.status(200).json({ myLikeStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
