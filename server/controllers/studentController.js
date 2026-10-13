const { Op } = require('sequelize');
const { Student, Allocation, Room, Hostel } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// GET /api/students?search=ro&course=IT&year=2&gender=MALE&unallocated=true
exports.getAll = asyncHandler(async (req, res) => {
  const { search, course, year, gender, unallocated } = req.query;
  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { rollNo: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }
  if (course) where.course = course;
  if (year) where.year = year;
  if (gender) where.gender = gender;

  const students = await Student.findAll({
    where,
    include: [{
      model: Allocation, as: 'allocations', where: { status: 'ACTIVE' }, required: false,
      include: [{ model: Room, as: 'room', include: [{ model: Hostel, as: 'hostel', attributes: ['name'] }] }],
    }],
    order: [['name', 'ASC']],
  });

  let result = students.map((s) => {
    const json = s.toJSON();
    const active = json.allocations[0];
    return {
      ...json,
      allocations: undefined,
      currentRoom: active ? `${active.room.hostel.name} - ${active.room.roomNumber}` : null,
    };
  });
  if (unallocated === 'true') result = result.filter((s) => !s.currentRoom);
  res.json(result);
});

exports.getOne = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id, {
    include: [{
      model: Allocation, as: 'allocations',
      include: [{ model: Room, as: 'room', include: [{ model: Hostel, as: 'hostel' }] }],
    }],
    order: [[{ model: Allocation, as: 'allocations' }, 'allocatedOn', 'DESC']],
  });
  if (!student) throw new AppError(404, 'Student not found');
  res.json(student);
});

exports.create = asyncHandler(async (req, res) => {
  const { rollNo, name, email, gender, course, year, phone } = req.body;
  const student = await Student.create({ rollNo, name, email, gender, course, year, phone });
  res.status(201).json(student);
});

exports.update = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) throw new AppError(404, 'Student not found');
  const { rollNo, name, email, gender, course, year, phone } = req.body;
  await student.update({ rollNo, name, email, gender, course, year, phone });
  res.json(student);
});

exports.remove = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) throw new AppError(404, 'Student not found');
  await student.destroy();
  res.status(204).send();
});
