const { Server } = require('socket.io');
const Message = require('./models/Message');
const Dialog = require('./models/Dialog');
const User = require('./models/User');
const path = require('path');
const fs = require('fs');

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('a user connected');

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

        dialog.unreadCount += 1;
        await dialog.save();

        const messageWithUsers = await Message.findOne({
          where: { id: message.id },
          include: [
            { model: User, as: 'Sender' },
            { model: User, as: 'Receiver' }
          ]
        });

        io.emit('chat message', messageWithUsers);

        const dialogs = await Dialog.findAll({
          where: { userId2: receiverId },
          include: [
            { model: User, as: 'User1' },
            { model: User, as: 'User2' }
          ]
        });
        io.emit('dialogs update', dialogs);
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

        socket.emit('dialogs update', dialogs);
      } catch (error) {
        console.error('Error fetching dialogs:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('delete message', async (messageId, userId) => {
      try {
        console.log(messageId)
        const message = await Message.findOne({ where: { id: messageId } });
        if (message && message.senderId === userId) {
          await message.destroy();
          io.emit('delete message', message);
        }
      } catch (e) {
        console.log(e)
      }
    })
  });


  return io;
};

module.exports = socketHandler;
