const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Comment = require('./Comment');

const LikeCom = sequelize.define('LikeCom', {
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
    commentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Comment,
            key: 'id'
        }
    }
});

User.hasMany(LikeCom, { foreignKey: 'userId' });
LikeCom.belongsTo(User, { foreignKey: 'userId' });

Comment.hasMany(LikeCom, { foreignKey: 'commentId' });
LikeCom.belongsTo(Comment, { foreignKey: 'commentId' });

module.exports = LikeCom;
