const { Op } = require('sequelize');
const { Room, Hostel, Allocation, Student } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const withOccupancy = (room) => {
  const json = room.toJSON();
  const occupied = (json.allocations || []).length;
  return { ...json, occupied, vacant: json.capacity - occupied, allocations: undefined };
};

// GET /api/rooms?hostelId=1&floor=0&minCapacity=2&available=true&search=10
// Advanced filtering using Sequelize operators (Op.gte, Op.like)
exports.getAll = asyncHandler(async (req, res) => {
  const { hostelId, floor, minCapacity, available, search } = req.query;
  const where = {};
  if (hostelId) where.hostelId = hostelId;
  if (floor !== undefined && floor !== '') where.floor = floor;
  if (minCapacity) where.capacity = { [Op.gte]: Number(minCapacity) };
  if (search) where.roomNumber = { [Op.like]: `%${search}%` };

  const rooms = await Room.findAll({
    where,
    include: [
      { model: Hostel, as: 'hostel', attributes: ['id', 'name', 'type'] },
      { model: Allocation, as: 'allocations', where: { status: 'ACTIVE' }, required: false, attributes: ['id'] },
    ],
    order: [['hostelId', 'ASC'], ['roomNumber', 'ASC']],
  });

  let result = rooms.map(withOccupancy);
  if (available === 'true') result = result.filter((r) => r.vacant > 0);
  res.json(result);
});

exports.getOne = asyncHandler(async (req, res) => {
  const room = await Room.findByPk(req.params.id, {
    include: [
      { model: Hostel, as: 'hostel' },
      {
        model: Allocation, as: 'allocations', where: { status: 'ACTIVE' }, required: false,
        include: [{ model: Student, as: 'student' }],
      },
    ],
  });
  if (!room) throw new AppError(404, 'Room not found');
  res.json(room);
});

exports.create = asyncHandler(async (req, res) => {
  const { hostelId, roomNumber, floor, capacity } = req.body;
  const hostel = await Hostel.findByPk(hostelId);
  if (!hostel) throw new AppError(400, 'Hostel does not exist');
  const room = await Room.create({ hostelId, roomNumber, floor, capacity });
  res.status(201).json(room);
});

exports.update = asyncHandler(async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (!room) throw new AppError(404, 'Room not found');
  const occupied = await Allocation.count({ where: { roomId: room.id, status: 'ACTIVE' } });
  if (req.body.capacity && Number(req.body.capacity) < occupied)
    throw new AppError(400, `Capacity cannot be less than current occupants (${occupied})`);
  const { roomNumber, floor, capacity } = req.body;
  await room.update({ roomNumber, floor, capacity });
  res.json(room);
});

exports.remove = asyncHandler(async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (!room) throw new AppError(404, 'Room not found');
  const occupied = await Allocation.count({ where: { roomId: room.id, status: 'ACTIVE' } });
  if (occupied > 0) throw new AppError(409, 'Cannot delete a room that still has occupants');
  await room.destroy();
  res.status(204).send();
});
