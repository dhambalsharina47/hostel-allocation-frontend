const { Hostel, Room } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const hostels = await Hostel.findAll({
    include: [{ model: Room, as: 'rooms', attributes: ['id'] }],
    order: [['name', 'ASC']],
  });
  res.json(hostels.map((h) => ({ ...h.toJSON(), roomCount: h.rooms.length, rooms: undefined })));
});

exports.getOne = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findByPk(req.params.id, { include: [{ model: Room, as: 'rooms' }] });
  if (!hostel) throw new AppError(404, 'Hostel not found');
  res.json(hostel);
});

exports.create = asyncHandler(async (req, res) => {
  const { name, type, wardenName } = req.body;
  const hostel = await Hostel.create({ name, type, wardenName });
  res.status(201).json(hostel);
});

exports.update = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findByPk(req.params.id);
  if (!hostel) throw new AppError(404, 'Hostel not found');
  const { name, type, wardenName } = req.body;
  await hostel.update({ name, type, wardenName });
  res.json(hostel);
});

exports.remove = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findByPk(req.params.id);
  if (!hostel) throw new AppError(404, 'Hostel not found');
  await hostel.destroy();
  res.status(204).send();
});
