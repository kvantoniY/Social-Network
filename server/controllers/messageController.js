const Message = require('../models/Message');
const Dialog = require('../models/Dialog');
const User = require('../models/User');
const { Op } = require('sequelize');

exports.getMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const otherUserId = req.params.userId;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      include: [
        { model: User, as: 'Sender' },
        { model: User, as: 'Receiver' }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Выполнение обновления сообщений и диалога после отправки ответа
    await Message.update(
      { read: true },
      {
        where: {
          receiverId: userId,
          senderId: otherUserId,
          read: false,
        },
      }
    );

    let dialog = await Dialog.findOne(
      {where: { userId1: otherUserId, userId2: userId }}
    );

    if (dialog) {
      dialog.unreadCount = 0;
      await dialog.save();
    }
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;
    const senderId = req.userId;

    //let dialog = await Dialog.findOne(
    //  {where: { userId1: senderId, userId2: receiverId }}
    //);
    let dialog = await Dialog.findAll(
      {where: {
        [Op.or]: [
          { userId1: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      },
    }
    );

    if (!dialog) {
      dialog = await Dialog.create({ userId1: senderId, userId2: receiverId });
      secondDialog = await Dialog.create({ userId1: receiverId, userId2: senderId });
    }

    const message = await Message.create({ content, senderId, receiverId });

    dialog.unreadCount += 1;
    secondDialog.unreadCount += 1;
    await dialog.save();
    await secondDialog.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markMessageAsRead = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.read = true;
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDialogs = async (req, res) => {
  try {
    const userId = req.userId;

    const dialogs = await Dialog.findAll(
      {where: { userId2: userId },
      include: [
        { model: User, as: 'User1' },
        { model: User, as: 'User2' }
      ]
    });

    res.status(200).json(dialogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDialog = async (req, res) => {
  try {
    const userId = req.userId;
    const {id} = req.body;
    let dialog = await Dialog.findOne({
      where: { userId1: userId, userId2: id }
    });

    console.log(`dialog: ${dialog}`)
    res.status(200).json(dialog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkDialogs = async (req, res) => {
  try {
    const userId = req.userId;
    const { dialogId, dialogUserId } = req.body;
    console.log(`----- ${dialogId} ----- ${userId} ------ ${dialogUserId}`)
    // Проверка прав пользователя
    const dialog = await Dialog.findOne({
      where: {
        dialogId,
        [Op.or]: [{ userId1: userId }, { userId2: dialogUserId }],
      },
    });
    const secondDialog = await Dialog.findOne({
      where: {
        dialogId,
        [Op.or]: [{ userId1: dialogUserId }, { userId2: userId }],
      },
    });

    if (!dialog || !secondDialog) {
      return res.status(403).json({ error: 'Unauthorized access to dialog' });;
    }
    res.status(200).json(dialog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
