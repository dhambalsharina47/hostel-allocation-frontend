const { sequelize, Student, Room, Hostel, Allocation } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const today = () => new Date().toISOString().slice(0, 10);

// GET /api/allocations?status=ACTIVE
exports.getAll = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  const rows = await Allocation.findAll({
    where,
    include: [
      { model: Student, as: 'student', attributes: ['id', 'name', 'rollNo', 'gender'] },
      { model: Room, as: 'room', include: [{ model: Hostel, as: 'hostel', attributes: ['id', 'name', 'type'] }] },
    ],
    order: [['allocatedOn', 'DESC'], ['id', 'DESC']],
  });
  res.json(rows);
});

// POST /api/allocations  { studentId, roomId }
// Business rules (run inside a transaction so two clerks can't over-fill a room):
//   1. student & room must exist
//   2. student cannot already have an ACTIVE allocation
//   3. hostel type must match student's gender
//   4. room must have a vacant bed
exports.create = asyncHandler(async (req, res) => {
  const { studentId, roomId } = req.body;
  if (!studentId || !roomId) throw new AppError(400, 'studentId and roomId are required');

  const created = await sequelize.transaction(async (t) => {
    const student = await Student.findByPk(studentId, { transaction: t });
    if (!student) throw new AppError(404, 'Student not found');

    // lock the room row so concurrent requests can't over-fill it
    const room = await Room.findByPk(roomId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!room) throw new AppError(404, 'Room not found');
    room.hostel = await Hostel.findByPk(room.hostelId, { transaction: t });

    const already = await Allocation.findOne({ where: { studentId, status: 'ACTIVE' }, transaction: t });
    if (already) throw new AppError(409, 'Student already has an active room allocation');

    const hostelGender = room.hostel.type === 'BOYS' ? 'MALE' : 'FEMALE';
    if (student.gender !== hostelGender)
      throw new AppError(400, `${room.hostel.name} is a ${room.hostel.type.toLowerCase()} hostel`);

    const occupied = await Allocation.count({ where: { roomId, status: 'ACTIVE' }, transaction: t });
    if (occupied >= room.capacity) throw new AppError(409, 'Room is full');

    return Allocation.create({ studentId, roomId, status: 'ACTIVE', allocatedOn: today() }, { transaction: t });
  });

  res.status(201).json(created);
});

// PATCH /api/allocations/:id/vacate
exports.vacate = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findByPk(req.params.id);
  if (!allocation) throw new AppError(404, 'Allocation not found');
  if (allocation.status === 'VACATED') throw new AppError(409, 'Already vacated');
  await allocation.update({ status: 'VACATED', vacatedOn: today() });
  res.json(allocation);
});

// DELETE /api/allocations/:id  (remove a record completely)
exports.remove = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findByPk(req.params.id);
  if (!allocation) throw new AppError(404, 'Allocation not found');
  await allocation.destroy();
  res.status(204).send();
});
