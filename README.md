# Productivity & Growth Tracker

A comprehensive, unified productivity management dashboard designed to help users track habits, tasks, goals, and learning sessions in one place, backed by a persistent cloud database with multi-user isolation.

---

## Features

- **Unified Productivity Dashboard**: Real-time overview of habits, tasks, goal roadmaps, learning sessions, and composite daily performance score.
- **Daily Performance Scoring**: Weighted scoring engine calculating daily productivity based on custom habit, task, and learning weights.
- **Habit Tracking**: Track daily habits, consistency streaks (current 🔥 and best streak), and a 7-day visual consistency matrix.
- **Task Kanban Board**: 4-column workflow (`To Do`, `In Progress`, `In Review`, `Done`) with drag-and-drop status transitions and priority filtering.
- **Goal Roadmaps & Milestones**: Multi-stage goal tracking with auto-balanced milestone points and overall completion indicators.
- **Focused Learning Logs**: Record study topics, session durations (minutes), and technical takeaways.
- **Built-in Focus Timer**: Integrated Pomodoro timer with configurable session intervals and quick logging to learning records.
- **Progress Insights & Charts**: Interactive 7-day productivity score and module trend charts powered by Recharts.
- **Overdue Task Warnings**: Real-time alerts highlighting overdue action items.
- **Customizable Preferences**: Configure daily scoring formula weights, module display toggles, and proactive score warning thresholds.
- **Cloud Database Persistence**: Full database persistence backed by Neon PostgreSQL through RESTful backend APIs.
- **Isolated Demo Mode**: Instant, in-memory preview mode with realistic pre-populated data under the demo profile **Alex Rivers**.
- **User-Scoped Clean Reset**: Reset productivity data directly to an empty zero state in Neon PostgreSQL without affecting user credentials or other users.

---

## Tech Stack

### Frontend
- **React.js 18** (Context API, Hooks, Component architecture)
- **Vite** (Build tooling and development server)
- **Tailwind CSS** (Modern dark-mode design system)
- **Framer Motion** (Micro-animations and layout transitions)
- **Recharts** (Interactive performance charts and trend lines)
- **Lucide React** (Modern iconography)
- **Date-fns** (Date manipulation and streak formatting)
- **Axios** (HTTP client with JWT authorization interceptors)

### Backend & Database
- **Node.js & Express.js** (Modular REST API framework)
- **Neon PostgreSQL** (Serverless cloud PostgreSQL database)
- **Sequelize ORM** (Relational models, associations, and transactional queries)
- **pg / pg-hstore** (PostgreSQL client driver with SSL connection pooling)
- **JSON Web Tokens (JWT)** (Stateless session authentication)
- **Bcrypt.js** (Cryptographic password hashing)

### AI-Assisted Development
- **Cursor**
- **Antigravity**

AI-assisted development tools were utilized for architectural design, code implementation, refactoring, and quality assurance.

---

## Architecture

The project is structured as a full-stack monorepo with strict separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                 Client (React + Vite)                       │
│  DataContext (State)  ◄───►  AuthContext (JWT & User Info)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST (Bearer JWT)
┌──────────────────────────────▼──────────────────────────────┐
│                Backend API (Express.js)                     │
│  Routes (/api/habits, /api/tasks, /api/goals, /api/auth...) │
│  Auth Middleware (JWT verification & req.userId scoping)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Sequelize ORM (SSL Pooled)
┌──────────────────────────────▼──────────────────────────────┐
│                 Neon PostgreSQL Database                    │
│  Users • Habits • HabitHistories • Tasks • Goals • Learnings │
└─────────────────────────────────────────────────────────────┘
```

The frontend client never communicates directly with Neon PostgreSQL. All read, write, update, and delete operations pass through Express.js API endpoints protected by JWT authentication middleware.

---

## Core Modules

### 1. Dashboard
- **Daily Performance Score**: Real-time composite score (0–100%) with grade tiers (A+, A, B, C).
- **Habit Quick Check-In**: One-click daily habit check-ins directly from the summary bar.
- **Task & Goal Summaries**: Live counts of active items and milestone completion percentages.
- **Weekly Trend Chart**: 7-day performance area chart displaying daily score distributions.

### 2. Habit Management
- Daily habit check-ins with toggleable status.
- Current streak and all-time best streak calculations.
- 7-day consistency dot matrix for every habit.
- Category tagging (Productivity, Learning, Health, Engineering, Mindset).

### 3. Task Management (Kanban Board)
- 4-column workflow: `To Do`, `In Progress`, `In Review`, and `Done`.
- Drag-and-drop cards across workflow columns.
- Priority levels (`HIGH`, `MED`, `LOW`) and overdue warning badges.
- Filtering by date range (Today, This Week, Overdue) and priority.

### 4. Goal Roadmaps & Learning Sessions
- Multi-milestone progress tracking (0–100%).
- Milestone point allocation with automated percentage calculations.
- Dedicated study logs with duration in minutes, topic tags, and notes.
- Focus mode integration with audio alerts and session logging.

### 5. Settings & Preferences
- **Daily Score Formula Weights**: Adjust contribution percentages for Habits, Tasks, and Learning (must total 100%).
- **Module Display Toggles**: Show or hide specific dashboard widgets (Habits, Tasks, Learning, Goals).
- **Alerts & Warnings**: Configure overdue task notifications and low-progress score warning thresholds.
- **Reset Productivity Data**: One-click user-scoped action card to clear records in Neon PostgreSQL.

---

## Authentication / Data Isolation

- **Secure Registration & Login**: User passwords are encrypted with `bcryptjs` before storage.
- **JWT Authorization**: Requests to protected endpoints require a signed Bearer token verified by the backend authentication middleware.
- **Strict Server-Side Isolation (`req.userId`)**: Every database query and mutation across `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` strictly scopes operations using `req.userId` extracted from the verified JWT:
  ```javascript
  // Example server-side query scoping
  Habit.findAll({ where: { userId: req.userId } });
  Task.findAll({ where: { userId: req.userId } });
  Goal.findAll({ where: { userId: req.userId } });
  Learning.findAll({ where: { userId: req.userId } });
  ```
- **Zero Frontend Authority**: The backend never accepts or trusts arbitrary `userId` parameters from the request body or query string.

---

## Data Persistence

Productivity data is persisted in **Neon PostgreSQL** through the backend REST APIs:

- The frontend does **not** use `localStorage` as the source of truth for productivity records.
- Authenticated user data is fetched on mount and updated via atomic REST API calls.
- Connection pooling and SSL encryption ensure reliable, low-latency communication with Neon Database.
- Database tables and relations are managed by Sequelize ORM models:
  - `Users` (User profile and credentials)
  - `Settings` (User-specific scoring weights and module toggles)
  - `Habits` & `HabitHistories` (Habits and daily check-in logs)
  - `Tasks` (Kanban tasks with status, priority, and due dates)
  - `Goals` & `Milestones` (Goal roadmaps and child milestones)
  - `Learnings` (Study sessions, duration, and key takeaways)

---

## Demo Mode

Demo Mode allows visitors to immediately explore all application features without creating an account:

- **Demo Profile**: **Alex Rivers** (`alex.rivers@productivity.com`).
- **Rich Sample Data**: Pre-loaded with realistic habits, Kanban tasks, goal roadmaps, learning sessions, and 7-day trend metrics.
- **In-Memory Isolation**: Demo Mode operations execute in isolated client memory (`client/src/data/demoData.js`) and do **not** write to, modify, or pollute real records in Neon PostgreSQL.
- **Seamless Transition**: Logging into an authenticated account immediately switches the application to live Neon PostgreSQL database endpoints.

---

## Reset Productivity Data

Authenticated users can reset their productivity records at any time from:

```text
Settings → Reset Productivity Data
```

Or from the top navigation profile dropdown:

```text
Profile Menu → Reset Productivity Data
```

### Reset Behavior:
1. The backend identifies the authenticated user via verified JWT `req.userId`.
2. Permanently deletes ONLY that user's productivity records from Neon PostgreSQL:
   - Habits
   - HabitHistories (Check-ins)
   - Tasks
   - Goals
   - Milestones
   - Learning sessions
3. Does **not** delete the user's account, email, password, profile information, or preferences.
4. Does **not** modify or delete any other user's data.
5. Does **not** insert default, sample, or template productivity records.
6. Returns the dashboard immediately to a clean zero state:
   - **Daily Score**: `0%`
   - **Habits**: `0`
   - **Tasks**: `0`
   - **Goals**: `0`
   - **Learning Sessions**: `0`
   - **Weekly Productivity**: Empty / zero

---

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Neon PostgreSQL account and database connection string

### 1. Clone the Repository & Install Dependencies

```sh
# Clone repository
git clone <repository-url>
cd progressOverview

# Install all dependencies (monorepo root, client, and server)
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory (or copy from `server/.env.example`):

```env
PORT=3000
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/neondb?sslmode=require
JWT_SECRET=your_secure_jwt_secret_key
```

*(Optional)* Create a `.env` file in the `client/` directory if connecting to a custom backend URL:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Initialize Database Tables

Synchronize the Sequelize models with your Neon PostgreSQL schema:

```sh
npm run server:sync
```

### 4. Start the Application

Start both the backend server and frontend client concurrently:

```sh
npm run dev
```

Or run services independently:

```sh
# Start backend server (runs on http://localhost:3000)
npm run server:dev

# Start frontend client (runs on http://localhost:5173)
npm run client:dev
```

### 5. Access the Application

Open your browser and navigate to:
- **Frontend Dashboard**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000/api`

---

## Project Structure

```text
progressOverview/
├── client/
│   ├── public/
│   │   └── assets/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── modals/
│   │   │   │   └── FocusModal.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── MotionWrapper.jsx
│   │   │   │   ├── ProgressBar.jsx
│   │   │   │   └── Toast.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── DataContext.jsx
│   │   ├── data/
│   │   │   └── demoData.js
│   │   ├── layout/
│   │   │   └── Layout.jsx
│   │   ├── lib/
│   │   │   └── utils.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── Habits.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── Learning.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── pdfReport.js       # Client PDF export utility
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── goals.js
│   │   ├── habits.js
│   │   ├── learning.js
│   │   ├── productivity.js
│   │   ├── settings.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── scripts/
│   │   ├── sync.js
│   │   ├── seed.js
│   │   └── test_clean_zero_reset.js
│   ├── index.js
│   ├── .env.example
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## License

This project is licensed under the [MIT License](LICENSE).
