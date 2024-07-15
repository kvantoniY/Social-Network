const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Follow = sequelize.define('Follow', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    followerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    followingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
});

User.belongsToMany(User, { through: Follow, as: 'Followers', foreignKey: 'followingId' });
User.belongsToMany(User, { through: Follow, as: 'Followings', foreignKey: 'followerId' });

module.exports = Follow;
