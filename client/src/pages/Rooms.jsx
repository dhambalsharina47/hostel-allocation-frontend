import { useEffect, useState } from 'react';
import { api, qs } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import Field from '../components/Field.jsx';

const emptyRoom = { hostelId: '', roomNumber: '', floor: 0, capacity: 2 };

export default function Rooms() {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [hostelFilter, setHostelFilter] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [form, setForm] = useState(emptyRoom);
  const [hostelForm, setHostelForm] = useState({ name: '', type: 'BOYS', wardenName: '' });
  const { notify, refresh, refreshKey } = useApp();

  useEffect(() => {
    api.get('/hostels').then(setHostels).catch((e) => notify(e.message, 'error'));
  }, [refreshKey, notify]);

  useEffect(() => {
    api
      .get('/rooms' + qs({ hostelId: hostelFilter, available: onlyAvailable ? 'true' : '' }))
      .then(setRooms)
      .catch((e) => notify(e.message, 'error'));
  }, [hostelFilter, onlyAvailable, refreshKey, notify]);

  const addHostel = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hostels', hostelForm);
      notify('Hostel added');
      setHostelForm({ name: '', type: 'BOYS', wardenName: '' });
      refresh();
    } catch (err) { notify(err.message, 'error'); }
  };

  const addRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rooms', { ...form, hostelId: Number(form.hostelId), floor: Number(form.floor), capacity: Number(form.capacity) });
      notify('Room added');
      setForm((f) => ({ ...emptyRoom, hostelId: f.hostelId }));
      refresh();
    } catch (err) { notify(err.message, 'error'); }
  };

  const removeRoom = async (r) => {
    if (!window.confirm(`Delete room ${r.roomNumber}?`)) return;
    try { await api.del(`/rooms/${r.id}`); notify('Room deleted'); refresh(); }
    catch (err) { notify(err.message, 'error'); }
  };

  const ch = (setter) => (e) => setter((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <>
      <h2>Hostels &amp; Rooms</h2>
      <div className="two-col">
        <form className="card form-grid" onSubmit={addHostel}>
          <h3>Add hostel</h3>
          <Field label="Name" name="name" value={hostelForm.name} onChange={ch(setHostelForm)} required />
          <Field label="Type">
            <select name="type" value={hostelForm.type} onChange={ch(setHostelForm)}>
              <option value="BOYS">Boys</option><option value="GIRLS">Girls</option>
            </select>
          </Field>
          <Field label="Warden" name="wardenName" value={hostelForm.wardenName} onChange={ch(setHostelForm)} required />
          <div className="actions"><button className="btn primary">Add hostel</button></div>
        </form>

        <form className="card form-grid" onSubmit={addRoom}>
          <h3>Add room</h3>
          <Field label="Hostel">
            <select name="hostelId" value={form.hostelId} onChange={ch(setForm)} required>
              <option value="">Select…</option>
              {hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </Field>
          <Field label="Room no." name="roomNumber" value={form.roomNumber} onChange={ch(setForm)} required />
          <Field label="Floor" type="number" min="0" name="floor" value={form.floor} onChange={ch(setForm)} />
          <Field label="Capacity (1-6)" type="number" min="1" max="6" name="capacity" value={form.capacity} onChange={ch(setForm)} />
          <div className="actions"><button className="btn primary">Add room</button></div>
        </form>
      </div>

      <div className="toolbar">
        <select value={hostelFilter} onChange={(e) => setHostelFilter(e.target.value)}>
          <option value="">All hostels</option>
          {hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <label className="check">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} /> Only rooms with vacancy
        </label>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Hostel</th><th>Room</th><th>Floor</th><th>Capacity</th><th>Occupied</th><th>Vacant</th><th /></tr></thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td>{r.hostel?.name}</td><td>{r.roomNumber}</td><td>{r.floor}</td><td>{r.capacity}</td><td>{r.occupied}</td>
                <td><span className={`badge ${r.vacant ? 'green' : 'red'}`}>{r.vacant ? `${r.vacant} free` : 'Full'}</span></td>
                <td className="row-actions"><button className="btn small danger" onClick={() => removeRoom(r)}>Delete</button></td>
              </tr>
            ))}
            {rooms.length === 0 && <tr><td colSpan="7" className="muted">No rooms found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
