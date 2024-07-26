const { Server } = require('socket.io');
const Message = require('./models/Message');
const Dialog = require('./models/Dialog');
const User = require('./models/User');
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
  
    socket.on('open dialog', (userId) => {
      activeDialogs.set(userId, true); // добавляем диалог в активные при открытии
      console.log(`open dialog, status active user: ${activeDialogs.has(userId)}`)
    });

    socket.on('close dialog', (userId) => {
      activeDialogs.delete(userId); // удаляем диалог из активных при закрытии'
      console.log(`close dialog, status active user: ${activeDialogs.has(userId)}`)
    });
  
    socket.on('chat message', async (msg) => {
      try {
        const { content, receiverId, senderId, image } = msg;
  
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
          secondDialog = await Dialog.create({ userId1: receiverId, userId2: senderId });
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
  
        let message = await Message.create({ content, senderId, receiverId, image: imageUrl });
        console.log(`receiverId: ${receiverId}, activeDialogsReceiverId: ${activeDialogs.get(receiverId)}, activeDialogsSenderId: ${activeDialogs.get(senderId)}`)
         if (!activeDialogs.has(senderId)) {
          dialog.unreadCount += 1;
          await dialog.save();
        }
  
        const messageWithUsers = await Message.findOne({
          where: { id: message.id },
          include: [
            { model: User, as: 'Sender' },
            { model: User, as: 'Receiver' }
          ]
        });
  
        io.to(receiverId).emit('chat message', messageWithUsers);
        io.to(senderId).emit('chat message', messageWithUsers);
  
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

        io.to(userId).emit('dialogs update', dialogs);
        io.to(userId).emit('get messages', messages);
      } catch (error) {
        console.log(error)
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('delete message', async (messageId, userId) => {
      try {
        const message = await Message.findOne({ where: { id: messageId } });
        if (message && message.senderId === userId) {
          await message.destroy();
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
