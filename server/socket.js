const { Server } = require('socket.io');
const Message = require('./models/Message');
const Dialog = require('./models/Dialog');
const User = require('./models/User');
const Notification = require('./models/Notification');
const Post = require('./models/Post')
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  });

  const activeDialogs = new Map(); // добавьте это в начало файла для хранения активных диалогов пользователей

  io.on('connection', (socket) => {
    console.log('a user connected');
  
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    });
  
    socket.on('open dialog', (otherUserId, userId) => {
      const dialogId = otherUserId + userId;
      socket.join(`dialog_${dialogId}`);
      activeDialogs.set(userId, true); // добавляем диалог в активные при открытии
      console.log(`open dialog, status active user: ${activeDialogs.has(dialogId)}`)
    });

    socket.on('close dialog', (otherUserId, userId) => {
      const dialogId = otherUserId + userId;
      activeDialogs.delete(dialogId); // удаляем диалог из активных при закрытии'
      activeDialogs.delete(userId); // удаляем диалог из активных при закрытии'
      console.log(`close dialog, status active user: ${activeDialogs.has(dialogId)}`)
    });
  
    socket.on('chat message', async (msg) => {
      try {
        const { content, receiverId, senderId, image } = msg;
        let isRead = true;
        const dialogId = receiverId + senderId;
        let dialog = await Dialog.findOne({
          where: { userId1: senderId, userId2: receiverId }
        });
        let secondDialog = await Dialog.findOne({
          where: { userId1: receiverId, userId2: senderId }
        });

        if (!dialog) {
          dialog = await Dialog.create({ userId1: senderId, userId2: receiverId, dialogId: dialogId });
        }
        if (!secondDialog) {
          secondDialog = await Dialog.create({ userId1: receiverId, userId2: senderId, dialogId: dialogId });
        }

        let imageUrl = null;
        if (image) {
          const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, 'base64');
          const imageName = `${Date.now()}.jpg`;
          const imagePath = path.join(__dirname, 'static', imageName);
          fs.writeFileSync(imagePath, buffer);
          imageUrl = imageName;
        }
        if (!activeDialogs.has(senderId)) {
          dialog.unreadCount += 1;
          await dialog.save();
          isRead = false;
        }
        let message = await Message.create({ content, senderId, receiverId, image: imageUrl, read: isRead });
  
        const messageWithUsers = await Message.findOne({
          where: { id: message.id },
          include: [
            { model: User, as: 'Sender' },
            { model: User, as: 'Receiver' }
          ]
        });
  
        io.to(`dialog_${dialogId}`).emit('chat message', messageWithUsers);
  
        const updateDialogs = async (userId) => {
          const dialogs = await Dialog.findAll({
            where: { userId2: userId },
            include: [
              { model: User, as: 'User1' },
              { model: User, as: 'User2' }
            ]
          });
          io.to(userId).emit('dialogs update', dialogs);
        }
  
        updateDialogs(receiverId);
        updateDialogs(senderId);
  
      } catch (error) {
        console.error('Error handling chat message:', error);
      }
    });
    socket.on('create_notification', async (data) => {
      const { type, userId, actorId, postId } = data;

      // Создание уведомления
      const notification = await Notification.create({ type, userId, actorId, postId });

      // Получение данных о пользователе и посте с использованием include
      const fullNotification = await Notification.findOne({
        where: { id: notification.id },
        include: [
          { model: User, as: 'User' },
          { model: User, as: 'Actor' },
          { model: Post, as: 'Post' }
        ]
      });

      // Формирование сообщения
      let message = '';
      switch (type) {
        case 'like':
          message = `Пользователь ${fullNotification.Actor.username} поставил лайк на ваш пост ${fullNotification.Post.id}`;
          break;
        case 'follow':
          message = `Пользователь ${fullNotification.Actor.username} подписался на вас`;
          break;
        case 'comment':
          message = `Пользователь ${fullNotification.Actor.username} написал комментарий к вашему посту ${fullNotification.Post.id}`;
          break;
        default:
          return;
      }

      fullNotification.message = message;
      await fullNotification.save();

      io.to(userId).emit('new_notification', fullNotification);
    });

    socket.on('mark_as_read', async (userId) => {
      console.log('mark as read', userId)
      await Notification.update({ isRead: true }, { where: { userId } });
      const notifications = await Notification.findAll({
        where: { userId },
        include: [
          { model: User, as: 'User' },
          { model: User, as: 'Actor' },
          { model: Post, as: 'Post' }
        ]
      });
      io.to(userId).emit('notifications', notifications);
    });

    socket.on('get_notifications', async (userId) => {
      const notifications = await Notification.findAll({
        where: { userId },
        include: [
          { model: User, as: 'User' },
          { model: User, as: 'Actor' },
          { model: Post, as: 'Post' }
        ]
      });
      io.to(userId).emit('notifications', notifications);
    });
    socket.on('get dialogs', async (userId) => {
      try {
        const dialogs = await Dialog.findAll({
          where: { userId2: userId },
          include: [
            { model: User, as: 'User1' },
            { model: User, as: 'User2' }
          ]
        });

        io.to(userId).emit('dialogs update', dialogs);
      } catch (error) {
        console.error('Error fetching dialogs:', error);
      }
    });

    socket.on('get messages', async (userId, otherUserId) => {
      console.log(userId, otherUserId)
      const dialogId = otherUserId + userId;
      try {
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
        const dialogs = await Dialog.findAll({
          where: { userId2: userId },
          include: [
            { model: User, as: 'User1' },
            { model: User, as: 'User2' }
          ]
        });

        const newMessages = await Message.findAll({
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

        io.to(userId).emit('dialogs update', dialogs);
        io.to(`dialog_${dialogId}`).emit('get messages', newMessages);

      } catch (error) {
        console.log(error)
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('delete message', async (messageId, userId, otherUserId) => {
      try {
        const message = await Message.findOne({ where: { id: messageId } });
        if (message && message.senderId === userId) {
          await message.destroy();
          let dialog = await Dialog.findOne(
            {where: { userId1: userId, userId2: otherUserId }}
          );
      
          if (dialog) {
            dialog.unreadCount = dialog.unreadCount - 1;
            await dialog.save();
          }
          const dialogs = await Dialog.findAll({
            where: { userId2: otherUserId },
            include: [
              { model: User, as: 'User1' },
              { model: User, as: 'User2' }
            ]
          });
          io.to(otherUserId).emit('dialogs update', dialogs);
          io.to(message.receiverId).emit('delete message', message);
          io.to(message.senderId).emit('delete message', message);
        }
      } catch (e) {
        console.log(e);
      }
    });
  });

  return io;
};

module.exports = socketHandler;
