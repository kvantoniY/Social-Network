const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Post = require('./Post');

const Message = sequelize.define('Message', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.JSON,  // Используем JSON для хранения массива изображений
    defaultValue: [],
    allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'message',
      allowNull: false
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Post,
        key: 'id'
      }
    },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

Message.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'Receiver', foreignKey: 'receiverId' });
Message.belongsTo(Post, { as: 'Post', foreignKey: 'postId' });
module.exports = Message;
