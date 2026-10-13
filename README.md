# Student Hostel Allocation Portal

Full-stack mini project (ISA-II backend + ISA-III frontend).

| Layer    | Tech |
|----------|------|
| Backend  | Node.js, Express, Sequelize ORM, MySQL (`/server`) |
| Frontend | React 18 (Hooks, Components, React Router), Vite (`/client`) |

## Folder structure
```
hostel-allocation-portal/
├── server/
│   ├── config/        DB config (config.js for CLI, database.js for app)
│   ├── models/        Hostel, Room, Student, Allocation + associations (index.js)
│   ├── migrations/    create all tables
│   ├── seeders/       demo data
│   ├── controllers/   hostel, room, student, allocation, report
│   ├── routes/        all routes mounted under /api
│   ├── middleware/    error handler (maps Sequelize errors -> HTTP codes)
│   └── server.js
└── client/            React app (pages, components, context, api.js)
```

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env          # then put your MySQL password in .env
npm run db:create             # creates the hostel_portal database
npm run db:migrate            # creates tables
npm run db:seed               # demo hostels, rooms, students, allocations
npm run dev                   # API on http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev                   # UI on http://localhost:5173
```
(Optional) copy `client/.env.example` to `client/.env` if your API runs on a different URL.

## Database design
- **Hostel 1 : M Room** (`Hostel.hasMany(Room)`)
- **Student M : N Room** through the **Allocation** junction table (stores status, allocatedOn, vacatedOn)
- Constraints: unique hostel name, unique student email & rollNo, unique (hostelId, roomNumber),
  non-null fields, capacity 1-6, year 1-4, custom 10-digit phone check, ENUMs for gender/type/status.

## Business rules (POST /api/allocations)
Runs in a transaction with a row lock on the room:
1. Student and room must exist (404)
2. Student can have only one ACTIVE allocation (409)
3. Hostel type must match student gender (400)
4. Room must have a vacant bed (409)

## API reference (base URL `http://localhost:5000/api`)

| Method | Endpoint | Description | Success | Errors |
|--------|----------|-------------|---------|--------|
| GET | `/hostels` | List hostels with room count | 200 | |
| GET | `/hostels/:id` | Hostel with its rooms | 200 | 404 |
| POST | `/hostels` | Create hostel | 201 | 400, 409 |
| PUT | `/hostels/:id` | Update hostel | 200 | 400, 404, 409 |
| DELETE | `/hostels/:id` | Delete hostel (cascades rooms) | 204 | 404 |
| GET | `/rooms` | List rooms with occupancy. Filters: `hostelId`, `floor`, `minCapacity`, `available=true`, `search` | 200 | |
| GET | `/rooms/:id` | Room + current occupants | 200 | 404 |
| POST | `/rooms` | Create room | 201 | 400, 409 |
| PUT | `/rooms/:id` | Update room | 200 | 400, 404 |
| DELETE | `/rooms/:id` | Delete room (only if empty) | 204 | 404, 409 |
| GET | `/students` | List students. Filters: `search`, `course`, `year`, `gender`, `unallocated=true` | 200 | |
| GET | `/students/:id` | Student + allocation history | 200 | 404 |
| POST | `/students` | Create student | 201 | 400, 409 |
| PUT | `/students/:id` | Update student | 200 | 400, 404, 409 |
| DELETE | `/students/:id` | Delete student | 204 | 404 |
| GET | `/allocations` | List allocations (`?status=ACTIVE\|VACATED`) | 200 | |
| POST | `/allocations` | Allocate room | 201 | 400, 404, 409 |
| PATCH | `/allocations/:id/vacate` | Mark as vacated | 200 | 404, 409 |
| DELETE | `/allocations/:id` | Delete record | 204 | 404 |
| GET | `/reports/occupancy` | **Raw SQL** occupancy per hostel | 200 | |
| GET | `/reports/summary` | **Raw SQL** dashboard counters | 200 | |

### Example payloads
```jsonc
// POST /api/hostels
{ "name": "Zuari Boys Hostel", "type": "BOYS", "wardenName": "Mr. D. Gaonkar" }

// POST /api/rooms
{ "hostelId": 1, "roomNumber": "201", "floor": 2, "capacity": 3 }

// POST /api/students
{ "rollNo": "2405010", "name": "Anil Naik", "email": "anil@example.com",
  "gender": "MALE", "course": "Computer Engg", "year": 2, "phone": "9876543210" }

// POST /api/allocations
{ "studentId": 5, "roomId": 2 }
```
Error shape: `{ "message": "Validation failed", "errors": ["Enter a valid email address"] }`

## Where each rubric item lives
| Requirement | File |
|-------------|------|
| DB connection | `server/config/database.js`, `server.js` |
| Migrations / seed | `server/migrations/`, `server/seeders/` |
| Associations 1:M and M:N | `server/models/index.js` |
| Validations & constraints | `server/models/*.js` |
| Raw SQL endpoint | `server/controllers/reportController.js` |
| Advanced filtering | `roomController.getAll`, `studentController.getAll` |
| Component reuse + props | `client/src/components/` |
| useState / useEffect | all pages |
| useContext + useReducer | `client/src/context/AppContext.jsx` |
| useRef / useMemo / useCallback | `StudentForm.jsx`, `Students.jsx`, `Allocations.jsx` |
| Routing | `client/src/App.jsx`, `Navbar.jsx` |

## 5-minute demo flow
1. Dashboard: occupancy table (raw SQL) → 2. Students: add a student → 3. Allocations: allocate them a room
→ 4. Dashboard: numbers/percentages updated → 5. Try allocating a full room to show the error → 6. Vacate and show history.
