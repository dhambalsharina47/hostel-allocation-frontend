const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Hostel', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: 'Hostel name is required' }, len: [3, 80] },
    },
    type: {
      type: DataTypes.ENUM('BOYS', 'GIRLS'),
      allowNull: false,
      validate: { isIn: { args: [['BOYS', 'GIRLS']], msg: 'Type must be BOYS or GIRLS' } },
    },
    wardenName: { type: DataTypes.STRING(80), allowNull: false, validate: { notEmpty: true } },
  }, { tableName: 'Hostels' });
