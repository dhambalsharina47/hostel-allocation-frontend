import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import StatCard from '../components/StatCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [occupancy, setOccupancy] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify, refreshKey } = useApp();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, o] = await Promise.all([api.get('/reports/summary'), api.get('/reports/occupancy')]);
        if (!cancelled) { setSummary(s); setOccupancy(o); }
      } catch (err) {
        notify(err.message, 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey, notify]);

  if (loading) return <p>Loading…</p>;
  if (!summary) return <p>Could not load data. Is the API running on port 5000?</p>;

  return (
    <>
      <h2>Dashboard</h2>
      <div className="stats">
        <StatCard label="Students" value={summary.students} />
        <StatCard label="Hostels" value={summary.hostels} tone="purple" />
        <StatCard label="Rooms" value={summary.rooms} tone="teal" />
        <StatCard label="Active allocations" value={summary.activeAllocations} tone="green" />
        <StatCard label="Waiting for a room" value={summary.unallocatedStudents} tone="amber" />
      </div>

      <h3>Hostel occupancy</h3>
      <div className="card">
        <table>
          <thead>
            <tr><th>Hostel</th><th>Type</th><th>Rooms</th><th>Beds</th><th>Occupied</th><th>Vacant</th><th style={{ width: 200 }}>Occupancy</th></tr>
          </thead>
          <tbody>
            {occupancy.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td><td>{h.type}</td><td>{h.totalRooms}</td><td>{h.totalCapacity}</td>
                <td>{h.occupiedBeds}</td><td>{h.vacantBeds}</td>
                <td><ProgressBar percent={h.occupancyPercent} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
