const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const BlackList = sequelize.define('BlackList', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    blUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
});


BlackList.belongsTo(User, { through: BlackList, as: 'BlockedUsers', foreignKey: 'userId' });
BlackList.belongsTo(User, { through: BlackList, as: 'BlockingUsers', foreignKey: 'blUserId' });

module.exports = BlackList;
