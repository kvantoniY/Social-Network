const { Server } = require('socket.io');
const Message = require('./models/Message');
const Dialog = require('./models/Dialog');
const User = require('./models/User');
const Comment = require('./models/Comment');
const Like = require("./models/Like");
const Notification = require('./models/Notification');
const Post = require('./models/Post')
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const BlackList = require('./models/BlackList');
const LikeCom = require('./models/LikeCom');
const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    },
    maxHttpBufferSize: 1e7 // Увеличиваем размер буфера до 10MB
  });

  const activeDialogs = new Map(); // добавьте это в начало файла для хранения активных диалогов пользователей

  io.on('connection', (socket) => {
    console.log('a user connected');
  
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    });
  
    socket.on('open dialog', (otherUserId, userId) => {
      const dialogId = [userId, otherUserId].sort().join('_');
      socket.join(`dialog_${dialogId}`);
      activeDialogs.set(userId, true); // добавляем диалог в активные при открытии
      console.log(`open dialog, status active user: ${activeDialogs.has(dialogId)}`)
    });

    socket.on('close dialog', (otherUserId, userId) => {
      const dialogId = [userId, otherUserId].sort().join('_');
      activeDialogs.delete(dialogId); // удаляем диалог из активных при закрытии'
      activeDialogs.delete(userId); // удаляем диалог из активных при закрытии'
      console.log(`close dialog, status active user: ${activeDialogs.has(dialogId)}`)
    });
  
    socket.on('chat message', async (msg) => {
      try {
        const { content, receiverId, senderId, images, type, postId } = msg;

        let isRead = true;

        const dialogId = [senderId, receiverId].sort().join('_');

        let blUser = await BlackList.findOne({ where: { blUserId: senderId, userId: receiverId } });
        let isBlackList = await BlackList.findOne({ where: { blUserId: receiverId, userId: senderId } });

        if (blUser) {
          io.to(`dialog_${dialogId}`).emit('error', { message: 'You are blocked by the receiver.' });
          return; // Прекратить выполнение, если пользователь заблокирован
        }
        if (isBlackList) {
          io.to(`dialog_${dialogId}`).emit('error', { message: 'You are blocked the receiver.' });
          return; // Прекратить выполнение, если пользователь заблокирован
        }

        let dialog = await Dialog.findOne({
          where: { userId1: senderId, userId2: receiverId }
        });
        let secondDialog = await Dialog.findOne({
          where: { userId1: receiverId, userId2: senderId }
        });
        if (!dialog) {
          dialog = await Dialog.create({ userId1: senderId, userId2: receiverId });
        }
        if (!secondDialog) {
          secondDialog = await Dialog.create({ userId1: receiverId, userId2: senderId});
        }

        const imagePaths = [];

        if (images && images.length > 0) {
          images.forEach((imageData, index) => {
            const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
            const fileName = `message_${Date.now()}_${index}.png`;
            const filePath = path.join(__dirname, 'static', fileName);
            fs.writeFileSync(filePath, base64Data, 'base64');
            imagePaths.push(fileName);
          });
        }

        if (!activeDialogs.has(senderId)) {
          dialog.unreadCount += 1;
          await dialog.save();
          isRead = false;
        }
        let typeMessage = 'message';
        let postIdMessage = null;
        
        if (type === 'share') {
          typeMessage = 'share';
          postIdMessage = postId;
        }

        let message = await Message.create({ content, senderId, receiverId, images: imagePaths, read: isRead, type: typeMessage, postId: postIdMessage });
  
        const messageWithUsers = await Message.findOne({
          where: { id: message.id },
          include: [
            { model: User, as: 'Sender' },
            { model: User, as: 'Receiver' },
            { model: Post, as: "Post", include: [{ model: User }] },
          ],
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
      const { type, userId, actorId, postId, commentId } = data;

      // Создание уведомления
      const notification = await Notification.create({ type, userId, actorId, postId, commentId });

      // Получение данных о пользователе и посте с использованием include
      const fullNotification = await Notification.findOne({
        where: { id: notification.id },
        include: [
          { model: User, as: 'User' },
          { model: User, as: 'Actor' },
          { model: Post, as: 'Post' },
          { model: Comment, as: 'Comment' }
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
        case 'likeCom':
          message = `Пользователь ${fullNotification.Actor.username} поставил лайк вашему комментарию ${fullNotification.Comment.id}`;
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
          { model: Post, as: 'Post' },
          { model: Comment, as: 'Comment' }
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
          { model: Post, as: 'Post' },
          { model: Comment, as: 'Comment' }
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
      const dialogId = [userId, otherUserId].sort().join('_');
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
            { model: User, as: 'Receiver' },
            { model: Post, as: "Post", include: [{ model: User }] },
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
              { senderId: otherUserId, receiverId: userId },
            ],
          },
          include: [
            { model: User, as: "Sender" },
            { model: User, as: "Receiver" },
            { model: Post, as: "Post", include: [
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
            ], },
          ],
          order: [["createdAt", "ASC"]],
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
