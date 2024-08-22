const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const UserSettings = sequelize.define('UserSettings', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    privateProfile: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    canMessage: {
        type: DataTypes.ENUM('everyone', 'mutuals', 'no_one'),
        defaultValue: 'everyone'
    },
    canComment: {
        type: DataTypes.ENUM('everyone', 'mutuals', 'no_one'),
        defaultValue: 'everyone'
    },
    notificationSound: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    messageSound: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    likeNotifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    commentNotifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    followerNotifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

UserSettings.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(UserSettings, { foreignKey: 'userId' });

module.exports = UserSettings;
