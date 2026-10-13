import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../context/AppContext.jsx';

export default function Allocations() {
  const [students, setStudents] = useState([]);   // only unallocated
  const [rooms, setRooms] = useState([]);         // only rooms with a vacancy
  const [allocations, setAllocations] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [view, setView] = useState('ACTIVE');
  const { notify, refresh, refreshKey } = useApp();

  useEffect(() => {
    Promise.all([
      api.get('/students?unallocated=true'),
      api.get('/rooms?available=true'),
      api.get(`/allocations?status=${view}`),
    ])
      .then(([s, r, a]) => { setStudents(s); setRooms(r); setAllocations(a); })
      .catch((e) => notify(e.message, 'error'));
  }, [view, refreshKey, notify]);

  // Only offer rooms from the hostel that matches the chosen student's gender
  const selectedStudent = students.find((s) => String(s.id) === String(studentId));
  const roomOptions = useMemo(() => {
    if (!selectedStudent) return rooms;
    const need = selectedStudent.gender === 'MALE' ? 'BOYS' : 'GIRLS';
    return rooms.filter((r) => r.hostel?.type === need);
  }, [rooms, selectedStudent]);

  const allocate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/allocations', { studentId: Number(studentId), roomId: Number(roomId) });
      notify('Room allocated');
      setStudentId(''); setRoomId('');
      refresh();
    } catch (err) { notify(err.message, 'error'); }
  };

  const vacate = async (a) => {
    try { await api.patch(`/allocations/${a.id}/vacate`); notify(`${a.student.name} vacated`); refresh(); }
    catch (err) { notify(err.message, 'error'); }
  };

  return (
    <>
      <h2>Allocations</h2>
      <form className="card form-grid" onSubmit={allocate}>
        <h3>Allocate a room</h3>
        <label className="field"><span>Student (unallocated)</span>
          <select value={studentId} onChange={(e) => { setStudentId(e.target.value); setRoomId(''); }} required>
            <option value="">Select student…</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
          </select>
        </label>
        <label className="field"><span>Room (with vacancy)</span>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
            <option value="">Select room…</option>
            {roomOptions.map((r) => (
              <option key={r.id} value={r.id}>{r.hostel?.name} – {r.roomNumber} ({r.vacant} free)</option>
            ))}
          </select>
        </label>
        <div className="actions"><button className="btn primary" disabled={!studentId || !roomId}>Allocate</button></div>
      </form>

      <div className="toolbar">
        <select value={view} onChange={(e) => setView(e.target.value)}>
          <option value="ACTIVE">Current allocations</option>
          <option value="VACATED">History (vacated)</option>
        </select>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Student</th><th>Roll No</th><th>Hostel</th><th>Room</th><th>Allocated on</th>{view === 'VACATED' && <th>Vacated on</th>}<th /></tr></thead>
          <tbody>
            {allocations.map((a) => (
              <tr key={a.id}>
                <td>{a.student.name}</td><td>{a.student.rollNo}</td><td>{a.room.hostel.name}</td><td>{a.room.roomNumber}</td>
                <td>{a.allocatedOn}</td>{view === 'VACATED' && <td>{a.vacatedOn}</td>}
                <td className="row-actions">
                  {a.status === 'ACTIVE' && <button className="btn small danger" onClick={() => vacate(a)}>Vacate</button>}
                </td>
              </tr>
            ))}
            {allocations.length === 0 && <tr><td colSpan="7" className="muted">Nothing to show.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
