const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/reports/occupancy
// RAW SQL: per-hostel capacity, occupied beds and occupancy %.
exports.occupancy = asyncHandler(async (req, res) => {
  const rows = await sequelize.query(
    `SELECT h.id, h.name, h.type,
            COUNT(DISTINCT r.id)                       AS totalRooms,
            COALESCE(cap.totalCapacity, 0)             AS totalCapacity,
            COUNT(a.id)                                AS occupiedBeds
     FROM Hostels h
     LEFT JOIN Rooms r ON r.hostelId = h.id
     LEFT JOIN Allocations a ON a.roomId = r.id AND a.status = 'ACTIVE'
     LEFT JOIN (SELECT hostelId, SUM(capacity) AS totalCapacity FROM Rooms GROUP BY hostelId) cap
            ON cap.hostelId = h.id
     GROUP BY h.id, h.name, h.type, cap.totalCapacity
     ORDER BY h.name`,
    { type: QueryTypes.SELECT }
  );

  const data = rows.map((r) => {
    const totalCapacity = Number(r.totalCapacity);
    const occupiedBeds = Number(r.occupiedBeds);
    return {
      id: r.id,
      name: r.name,
      type: r.type,
      totalRooms: Number(r.totalRooms),
      totalCapacity,
      occupiedBeds,
      vacantBeds: totalCapacity - occupiedBeds,
      occupancyPercent: totalCapacity ? Math.round((occupiedBeds / totalCapacity) * 100) : 0,
    };
  });
  res.json(data);
});

// GET /api/reports/summary  (raw SQL with named replacements)
exports.summary = asyncHandler(async (req, res) => {
  const [row] = await sequelize.query(
    `SELECT
       (SELECT COUNT(*) FROM Students)                                  AS students,
       (SELECT COUNT(*) FROM Hostels)                                   AS hostels,
       (SELECT COUNT(*) FROM Rooms)                                     AS rooms,
       (SELECT COUNT(*) FROM Allocations WHERE status = :status)        AS activeAllocations,
       (SELECT COUNT(*) FROM Students s
          WHERE NOT EXISTS (SELECT 1 FROM Allocations a
                            WHERE a.studentId = s.id AND a.status = :status)) AS unallocatedStudents`,
    { replacements: { status: 'ACTIVE' }, type: QueryTypes.SELECT }
  );
  res.json(Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v)])));
});
