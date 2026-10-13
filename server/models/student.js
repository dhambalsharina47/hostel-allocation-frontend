const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Student', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    rollNo: { type: DataTypes.STRING(20), allowNull: false, unique: true, validate: { notEmpty: true } },
    name: { type: DataTypes.STRING(100), allowNull: false, validate: { notEmpty: { msg: 'Name is required' } } },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: 'Enter a valid email address' } },
    },
    gender: { type: DataTypes.ENUM('MALE', 'FEMALE'), allowNull: false },
    course: { type: DataTypes.STRING(60), allowNull: false },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: { args: [1], msg: 'Year must be 1-4' }, max: { args: [4], msg: 'Year must be 1-4' } },
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      // custom data check
      validate: { isTenDigits(v) { if (v && !/^\d{10}$/.test(v)) throw new Error('Phone must be 10 digits'); } },
    },
  }, { tableName: 'Students' });
