const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    about: {
        type: DataTypes.STRING,
    },
    role: {
        type: DataTypes.ENUM('User', 'Admin'),
        defaultValue: 'User'
    },
    image: {
        type: DataTypes.STRING,
        defaultValue: "default.jpg",
    },
});

module.exports = User;
