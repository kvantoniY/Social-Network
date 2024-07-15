const Post = require("../models/Post");
const Like = require("../models/Like");
const User = require("../models/User");
const Comment = require("../models/Comment");
const uuid = require("uuid");
const path = require("path");

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    console.log(req.files);
    if (req.files && req.files.image) {
      const image = req.files.image;
      let fileName = uuid.v4() + ".jpg";
      await image.mv(path.resolve(__dirname, "..", "static", fileName));
      const addPost = await Post.create({
        content,
        userId: req.userId,
        image: fileName,
      });
      // Найдите пользователя, чтобы вернуть его вместе с комментарием
      const user = await User.findByPk(req.userId);

      const post = await Post.findByPk(addPost.id, {
        include: [{ model: Like }, { model: Comment }, {model: User}],
      });
      res.status(201).json(post);
    } else {
      const addPost = await Post.create({
        content,
        userId: req.userId,
        image: "",
      });
      // Найдите пользователя, чтобы вернуть его вместе с комментарием

      const post = await Post.findByPk(addPost.id, {
        include: [{ model: Like }, { model: Comment }, {model: User}],
      });
      console.log(post)
      res.status(201).json(post);
    }
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
              include: [{ model: User }], // Загружаем комментарии к посту и связанных с ними пользователей
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
          const likeStatus = post.Likes.some(like => like.userId === req.userId);
          return {
            ...post.get({ plain: true }),
            likeStatus,
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
          include: [{ model: User }], // Загружаем комментарии к посту и связанных с ними пользователей
        },
        {
          model: Like,
          include: [{ model: Post }], // Загружаем лайки к посту и связанные с ними посты
        },
        {
          model: User,
        },
      ],
    });
    const postsWithLikeStatus = posts.map(post => {
      const likeStatus = post.Likes.some(like => like.userId === req.userId);
      return {
        ...post.get({ plain: true }),
        likeStatus,
      };
    });
    console.log(`postsWithLikeStatus: ${JSON.stringify(postsWithLikeStatus,null, 2)}`)
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
