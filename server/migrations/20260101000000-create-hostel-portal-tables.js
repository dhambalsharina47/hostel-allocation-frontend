'use strict';

module.exports = {
  async up(qi, Sequelize) {
    const ts = {
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    };

    await qi.createTable('Hostels', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(80), allowNull: false, unique: true },
      type: { type: Sequelize.ENUM('BOYS', 'GIRLS'), allowNull: false },
      wardenName: { type: Sequelize.STRING(80), allowNull: false },
      ...ts,
    });

    await qi.createTable('Rooms', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      hostelId: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'Hostels', key: 'id' }, onDelete: 'CASCADE',
      },
      roomNumber: { type: Sequelize.STRING(10), allowNull: false },
      floor: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      capacity: { type: Sequelize.INTEGER, allowNull: false },
      ...ts,
    });
    await qi.addIndex('Rooms', ['hostelId', 'roomNumber'], { unique: true, name: 'rooms_hostel_roomno_unique' });

    await qi.createTable('Students', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      rollNo: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(120), allowNull: false, unique: true },
      gender: { type: Sequelize.ENUM('MALE', 'FEMALE'), allowNull: false },
      course: { type: Sequelize.STRING(60), allowNull: false },
      year: { type: Sequelize.INTEGER, allowNull: false },
      phone: { type: Sequelize.STRING(15), allowNull: true },
      ...ts,
    });

    await qi.createTable('Allocations', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      studentId: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'Students', key: 'id' }, onDelete: 'CASCADE',
      },
      roomId: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'Rooms', key: 'id' }, onDelete: 'CASCADE',
      },
      status: { type: Sequelize.ENUM('ACTIVE', 'VACATED'), allowNull: false, defaultValue: 'ACTIVE' },
      allocatedOn: { type: Sequelize.DATEONLY, allowNull: false, defaultValue: Sequelize.literal('(CURRENT_DATE)') },
      vacatedOn: { type: Sequelize.DATEONLY, allowNull: true },
      ...ts,
    });
  },

  async down(qi) {
    await qi.dropTable('Allocations');
    await qi.dropTable('Students');
    await qi.dropTable('Rooms');
    await qi.dropTable('Hostels');
  },
};
