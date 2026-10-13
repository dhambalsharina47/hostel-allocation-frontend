const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Room', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    hostelId: { type: DataTypes.INTEGER, allowNull: false },
    roomNumber: { type: DataTypes.STRING(10), allowNull: false, validate: { notEmpty: true } },
    floor: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0, max: 20 } },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: { args: [1], msg: 'Capacity must be at least 1' }, max: { args: [6], msg: 'Capacity cannot exceed 6' } },
    },
  }, {
    tableName: 'Rooms',
    indexes: [{ unique: true, fields: ['hostelId', 'roomNumber'] }],
  });
