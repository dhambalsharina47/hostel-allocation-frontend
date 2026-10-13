const router = require('express').Router();
const hostel = require('../controllers/hostelController');
const room = require('../controllers/roomController');
const student = require('../controllers/studentController');
const allocation = require('../controllers/allocationController');
const report = require('../controllers/reportController');

router.route('/hostels').get(hostel.getAll).post(hostel.create);
router.route('/hostels/:id').get(hostel.getOne).put(hostel.update).delete(hostel.remove);

router.route('/rooms').get(room.getAll).post(room.create);
router.route('/rooms/:id').get(room.getOne).put(room.update).delete(room.remove);

router.route('/students').get(student.getAll).post(student.create);
router.route('/students/:id').get(student.getOne).put(student.update).delete(student.remove);

router.route('/allocations').get(allocation.getAll).post(allocation.create);
router.patch('/allocations/:id/vacate', allocation.vacate);
router.delete('/allocations/:id', allocation.remove);

router.get('/reports/occupancy', report.occupancy);
router.get('/reports/summary', report.summary);

module.exports = router;
