import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/students', label: 'Students' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/allocations', label: 'Allocations' },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <h1>🏠 Hostel Allocation Portal</h1>
      <nav>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
