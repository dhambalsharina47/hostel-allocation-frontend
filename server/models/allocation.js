const { DataTypes } = require('sequelize');

// Junction table for the Student <-> Room many-to-many relation.
// It carries extra data (status + dates) so we keep the full allocation history.
module.exports = (sequelize) =>
  sequelize.define('Allocation', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    roomId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('ACTIVE', 'VACATED'), allowNull: false, defaultValue: 'ACTIVE' },
    allocatedOn: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    vacatedOn: { type: DataTypes.DATEONLY, allowNull: true },
  }, { tableName: 'Allocations' });
