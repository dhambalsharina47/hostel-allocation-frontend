import { useEffect, useRef, useState } from 'react';
import Field from './Field.jsx';

const empty = { rollNo: '', name: '', email: '', gender: 'MALE', course: '', year: 1, phone: '' };

export default function StudentForm({ editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(empty);
  const nameRef = useRef(null);

  // when "Edit" is clicked, load that student into the form
  useEffect(() => {
    setForm(editing ? { ...empty, ...editing, phone: editing.phone || '' } : empty);
    nameRef.current?.focus();
  }, [editing]);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const ok = await onSubmit({ ...form, year: Number(form.year) });
    if (ok) {
      setForm(empty);
      nameRef.current?.focus();
    }
  };

  return (
    <form className="card form-grid" onSubmit={submit}>
      <h3>{editing ? 'Edit student' : 'Add student'}</h3>
      <Field label="Roll No" name="rollNo" value={form.rollNo} onChange={change} required />
      <Field label="Full name" name="name" value={form.name} onChange={change} ref={nameRef} required />
      <Field label="Email" type="email" name="email" value={form.email} onChange={change} required />
      <Field label="Gender">
        <select name="gender" value={form.gender} onChange={change}>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
      </Field>
      <Field label="Course" name="course" value={form.course} onChange={change} required />
      <Field label="Year">
        <select name="year" value={form.year} onChange={change}>
          {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </Field>
      <Field label="Phone (10 digits)" name="phone" value={form.phone} onChange={change} maxLength={10} />
      <div className="actions">
        <button className="btn primary" type="submit">{editing ? 'Update' : 'Add student'}</button>
        {editing && <button className="btn" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
