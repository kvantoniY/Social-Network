const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Post = require('./Post');

const Notification = sequelize.define('Notification', {
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  actorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Post,
      key: 'id',
    },
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

User.hasMany(Notification, { foreignKey: 'userId', as: 'User' });
User.hasMany(Notification, { foreignKey: 'actorId', as: 'Actor' });
Post.hasMany(Notification, { foreignKey: 'postId' });

Notification.belongsTo(User, { foreignKey: 'userId', as: 'User' });
Notification.belongsTo(User, { foreignKey: 'actorId', as: 'Actor' });
Notification.belongsTo(Post, { foreignKey: 'postId' });

module.exports = Notification;
