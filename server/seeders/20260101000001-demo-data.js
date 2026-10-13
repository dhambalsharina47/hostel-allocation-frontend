'use strict';

module.exports = {
  async up(qi) {
    const now = new Date();
    const t = { createdAt: now, updatedAt: now };

    await qi.bulkInsert('Hostels', [
      { id: 1, name: 'Sahyadri Boys Hostel', type: 'BOYS', wardenName: 'Mr. R. Naik', ...t },
      { id: 2, name: 'Mandovi Girls Hostel', type: 'GIRLS', wardenName: 'Mrs. S. Fernandes', ...t },
    ]);

    const rooms = [];
    let id = 1;
    [1, 2].forEach((hostelId) => {
      [0, 1].forEach((floor) => {
        for (let n = 1; n <= 3; n++) {
          rooms.push({ id: id++, hostelId, floor, roomNumber: `${floor}0${n}`, capacity: n === 3 ? 3 : 2, ...t });
        }
      });
    });
    await qi.bulkInsert('Rooms', rooms);

    await qi.bulkInsert('Students', [
      { id: 1, rollNo: '2405001', name: 'Rohan Gawas', email: 'rohan@example.com', gender: 'MALE', course: 'Computer Engg', year: 2, phone: '9876500001', ...t },
      { id: 2, rollNo: '2405002', name: 'Aditya Kamat', email: 'aditya@example.com', gender: 'MALE', course: 'Computer Engg', year: 2, phone: '9876500002', ...t },
      { id: 3, rollNo: '2405003', name: 'Sneha Prabhu', email: 'sneha@example.com', gender: 'FEMALE', course: 'IT', year: 2, phone: '9876500003', ...t },
      { id: 4, rollNo: '2405004', name: "Maria D'Costa", email: 'maria@example.com', gender: 'FEMALE', course: 'IT', year: 3, phone: '9876500004', ...t },
      { id: 5, rollNo: '2405005', name: 'Karan Shetye', email: 'karan@example.com', gender: 'MALE', course: 'Mechanical', year: 1, phone: '9876500005', ...t },
    ]);

    await qi.bulkInsert('Allocations', [
      { studentId: 1, roomId: 1, status: 'ACTIVE', allocatedOn: '2026-07-01', ...t },
      { studentId: 2, roomId: 1, status: 'ACTIVE', allocatedOn: '2026-07-01', ...t },
      { studentId: 3, roomId: 7, status: 'ACTIVE', allocatedOn: '2026-07-02', ...t },
    ]);
  },

  async down(qi) {
    await qi.bulkDelete('Allocations', null, {});
    await qi.bulkDelete('Students', null, {});
    await qi.bulkDelete('Rooms', null, {});
    await qi.bulkDelete('Hostels', null, {});
  },
};
