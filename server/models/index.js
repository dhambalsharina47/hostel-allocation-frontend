const sequelize = require('../config/database');

const Hostel = require('./hostel')(sequelize);
const Room = require('./room')(sequelize);
const Student = require('./student')(sequelize);
const Allocation = require('./allocation')(sequelize);

// 1 : M  -> a Hostel has many Rooms
Hostel.hasMany(Room, { foreignKey: 'hostelId', as: 'rooms', onDelete: 'CASCADE' });
Room.belongsTo(Hostel, { foreignKey: 'hostelId', as: 'hostel' });

// M : N  -> Students <-> Rooms through Allocations (junction table)
Student.belongsToMany(Room, { through: Allocation, foreignKey: 'studentId', otherKey: 'roomId', as: 'rooms' });
Room.belongsToMany(Student, { through: Allocation, foreignKey: 'roomId', otherKey: 'studentId', as: 'students' });

// Direct links to the junction rows (needed for eager loading with status)
Student.hasMany(Allocation, { foreignKey: 'studentId', as: 'allocations', onDelete: 'CASCADE' });
Allocation.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Room.hasMany(Allocation, { foreignKey: 'roomId', as: 'allocations', onDelete: 'CASCADE' });
Allocation.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

module.exports = { sequelize, Hostel, Room, Student, Allocation };
