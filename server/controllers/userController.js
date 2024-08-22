const User = require('../models/User');
const BlackList = require('../models/BlackList');
const uuid = require("uuid");
const path = require("path");
const Follow = require('../models/Follow');
const UserSettings = require('../models/UserSettings');

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

exports.blackListUsers = async (req, res) => {
  const userId = req.params.userId; 
  try {
    let isBlackList = await BlackList.findOne({ where: { blUserId: userId, userId: req.userId } });
    let blUser = await BlackList.findOne({ where: { blUserId: req.userId, userId: userId } });
    if (!blUser) {
      blUser = false
    }
    if (!isBlackList) {
      isBlackList = false
    }
    res.status(200).json({blUser, isBlackList});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.allBlackListUsers = async (req, res) => {
  try {
    // Получаем пользователей, которых заблокировал текущий пользователь
    const blockedUsers = await BlackList.findAll({ where: { userId: req.userId } });

    // Получаем пользователей, которые заблокировали текущего пользователя
    const usersWhoBlockedMe = await BlackList.findAll({ where: { blUserId: req.userId } });

    // Объединяем оба списка
    const blackList = [...blockedUsers, ...usersWhoBlockedMe];
    
    res.status(200).json(blackList.length > 0 ? blackList : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.myBlackListUsers = async (req, res) => {
  try {
    // Получаем пользователей, которых заблокировал текущий пользователь
    const blockedUsers = await BlackList.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: User,
          as: 'BlockingUsers', 
        },
      ],
    });

    // Получаем пользователей, которые заблокировали текущего пользователя
    const usersWhoBlockedMe = await BlackList.findAll({
      where: { blUserId: req.userId },
      include: [
        {
          model: User,
          as: 'BlockedUsers',
        },
      ],
    });

    // Формируем правильную структуру ответа
    const blackList = {
      blockedUsers: blockedUsers.map(bl => bl.BlockingUsers),
      usersWhoBlockedMe: usersWhoBlockedMe.map(bl => bl.BlockedUsers)
    };

    console.log('Blocked Users:', JSON.stringify(blackList, null, 2));
    res.status(200).json(blackList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addBlackListUser = async (req, res) => {
  const userId = req.params.userId;
  if (userId === req.userId) {
    return res.status(400).json({ error: 'cant black list owner' });
  }
  try {
    const blUser = await BlackList.create({
      blUserId: userId,
      userId: req.userId
    });
    let follow = await Follow.findOne({ where: { followerId: req.userId, followingId: userId } });
    if (follow) {
      await follow.destroy();
    }

    follow = await Follow.findOne({ where: { followerId: userId, followingId: req.userId } });
    if (follow) {
      await follow.destroy();
    }

    res.status(200).json(blUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteBlackListUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const blUser = await BlackList.findOne({ where: { blUserId: userId, userId: req.userId } });
    await blUser.destroy()
    res.status(200).json(blUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserSettings = async (req, res) => {
  try {
      const settings = await UserSettings.findOne({ where: { userId: req.userId } });
      if (!settings) {
          return res.status(404).json({ error: 'Settings not found' });
      }
      res.status(200).json(settings);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};
exports.getCurrentUserSettings = async (req, res) => {
  try {
      const {id} = req.body;
      console.log(`current id ${id}`)
      const settings = await UserSettings.findOne({ where: { userId: id } });
      if (!settings) {
          return res.status(404).json({ error: 'Settings not found' });
      }
      res.status(200).json(settings);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

exports.updateUserSettings = async (req, res) => {
  const {
      notificationSound,
      messageSound,
      likeNotifications,
      commentNotifications,
      followerNotifications,
      privateProfile,
      canMessage,
      canComment,
  } = req.body;

  try {
      const settings = await UserSettings.findOne({ where: { userId: req.userId } });

      if (!settings) {
          return res.status(404).json({ error: 'Settings not found' });
      }

      // Обновляем настройки только если они переданы в запросе
      settings.notificationSound = notificationSound ?? settings.notificationSound;
      settings.messageSound = messageSound ?? settings.messageSound;
      settings.likeNotifications = likeNotifications ?? settings.likeNotifications;
      settings.commentNotifications = commentNotifications ?? settings.commentNotifications;
      settings.followerNotifications = followerNotifications ?? settings.followerNotifications;
      settings.privateProfile = privateProfile ?? settings.privateProfile;
      settings.canMessage = canMessage ?? settings.canMessage;
      settings.canComment = canComment ?? settings.canComment;

      // Сохраняем обновленные настройки
      await settings.save();

      res.status(200).json(settings);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

