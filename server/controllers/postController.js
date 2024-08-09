const Post = require("../models/Post");
const Like = require("../models/Like");
const User = require("../models/User");
const Comment = require("../models/Comment");
const uuid = require("uuid");
const path = require("path");
const LikeCom = require("../models/LikeCom");

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const images = [];

    if (req.files && req.files.images) {
      const uploadedImages = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      for (const image of uploadedImages) {
        let fileName = uuid.v4() + ".jpg";
        await image.mv(path.resolve(__dirname, "..", "static", fileName));
        images.push(fileName);
      }
    }

    const addPost = await Post.create({
      content,
      userId: req.userId,
      images, // Сохраняем массив изображений
    });

    const post = await Post.findByPk(addPost.id, {
      include: [{ model: Like }, { model: Comment }, { model: User }],
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postId, {
      include: [{ model: Like }, { model: Comment }],
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']], // Сортировка по дате создания в обратном порядке
      include: [
        {
          model: Comment,
          include: [
            { model: User },
            {
              model: LikeCom,
              include: [{ model: User }] // Включаем пользователей для лайков комментариев
            }
          ], // Загружаем комментарии к посту и связанных с ними пользователей и лайки комментариев
        },
        {
          model: Like,
          include: [{ model: User }] // Загружаем лайки к посту и связанные с ними пользователи
        },
        {
          model: User
        },
      ],
    });

    const postsWithLikeStatus = posts.map(post => {
      const postLikeStatus = post.Likes.some(like => like.userId === req.userId);

      // Обработка комментариев
      const commentsWithLikeStatus = post.Comments.map(comment => {
        const commentLikeStatus = comment.LikeComs.some(likeCom => likeCom.userId === req.userId);
        return {
          ...comment.get({ plain: true }),
          likeStatus: commentLikeStatus,
        };
      });

      return {
        ...post.get({ plain: true }),
        likeStatus: postLikeStatus,
        Comments: commentsWithLikeStatus, // Добавляем комментарии с likeStatus
      };
    });

    res.status(200).json(postsWithLikeStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: {
        userId: req.params.userId, // Ищем посты, созданные пользователем с указанным ID
      },
      order: [['createdAt', 'DESC']], // Сортировка по дате создания в обратном порядке
      include: [
        {
            model: Comment,
            include: [
              { model: User },
              {
                model: LikeCom,
                include: [{ model: User }] // Включаем пользователей для лайков комментариев
              }
            ], // Загружаем комментарии к посту и связанных с ними пользователей и лайки комментариев
        },
        {
          model: Like,
          include: [{ model: User }], // Загружаем лайки к посту и связанные с ними посты
        },
        {
          model: User,
        },
      ],
    });
    const postsWithLikeStatus = posts.map(post => {
      const postLikeStatus = post.Likes.some(like => like.userId === req.userId);
      // Обработка комментариев
      const commentsWithLikeStatus = post.Comments.map(comment => {
        const commentLikeStatus = comment.LikeComs.some(likeCom => likeCom.userId === req.userId);
        return {
          ...comment.get({ plain: true }),
          likeStatus: commentLikeStatus,
        };
      });

      return {
        ...post.get({ plain: true }),
        likeStatus: postLikeStatus,
        Comments: commentsWithLikeStatus, // Добавляем комментарии с likeStatus
      };
    });

    res.status(200).json(postsWithLikeStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findOne({ where: { id: postId } });
    if (!post || post.userId !== req.userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }
    await post.destroy();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
