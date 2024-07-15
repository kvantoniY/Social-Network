const User = require('../models/User');
const uuid = require("uuid");
const path = require("path");

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({where: {username: req.body.username }});
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editUserAvatar = async (req, res) => {
  if (req.files) {
    const { image } = req.files;
    let fileName = uuid.v4() + ".jpg";
    image.mv(path.resolve(__dirname, "..", "static", fileName));
    const user_edit = await User.update(
      {
        image: fileName,
      },
      {
        where: {
          id: req.userId,
        },
      }
    );
    res.status(200).json(fileName);
  } 
};

exports.editUser = async (req, res) => {
  let { about } = req.body;
  const user_edit = await User.update(
    {
      about: about,
    },
    {
      where: {
        id: req.userId,
      },
    }
  );
   res.status(200).json(about);
};

