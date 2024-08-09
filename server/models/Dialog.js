const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Dialog = sequelize.define("Dialog", {
  userId1: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  userId2: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  unreadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

// Ассоциации
Dialog.belongsTo(User, { as: "User1", foreignKey: "userId1" });
Dialog.belongsTo(User, { as: "User2", foreignKey: "userId2" });

module.exports = Dialog;
