import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, qs } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import StudentForm from '../components/StudentForm.jsx';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [editing, setEditing] = useState(null);
  const { notify, refresh, refreshKey } = useApp();

  const load = useCallback(async () => {
    try {
      setStudents(await api.get('/students' + qs({ search, gender: genderFilter })));
    } catch (err) {
      notify(err.message, 'error');
    }
  }, [search, genderFilter, notify]);

  // re-fetch whenever filters change (debounced) or shared data changes
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load, refreshKey]);

  const sorted = useMemo(
    () => [...students].sort((a, b) => String(a[sortBy]).localeCompare(String(b[sortBy]), undefined, { numeric: true })),
    [students, sortBy]
  );

  const save = useCallback(async (data) => {
    try {
      if (editing) {
        await api.put(`/students/${editing.id}`, data);
        notify('Student updated');
        setEditing(null);
      } else {
        await api.post('/students', data);
        notify('Student added');
      }
      refresh();
      return true;
    } catch (err) {
      notify(err.message, 'error');
      return false;
    }
  }, [editing, notify, refresh]);

  const remove = async (s) => {
    if (!window.confirm(`Delete ${s.name}?`)) return;
    try {
      await api.del(`/students/${s.id}`);
      notify('Student deleted');
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <>
      <h2>Students</h2>
      <StudentForm editing={editing} onSubmit={save} onCancel={() => setEditing(null)} />

      <div className="toolbar">
        <input placeholder="Search name / roll no / email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
          <option value="">All genders</option><option value="MALE">Male</option><option value="FEMALE">Female</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort: Name</option><option value="rollNo">Sort: Roll No</option><option value="year">Sort: Year</option>
        </select>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Roll No</th><th>Name</th><th>Course</th><th>Year</th><th>Gender</th><th>Current room</th><th /></tr></thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.id}>
                <td>{s.rollNo}</td><td>{s.name}</td><td>{s.course}</td><td>{s.year}</td><td>{s.gender}</td>
                <td>{s.currentRoom ?? <span className="badge amber">Not allocated</span>}</td>
                <td className="row-actions">
                  <button className="btn small" onClick={() => setEditing(s)}>Edit</button>
                  <button className="btn small danger" onClick={() => remove(s)}>Delete</button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && <tr><td colSpan="7" className="muted">No students found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
