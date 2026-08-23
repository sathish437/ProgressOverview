# Productivity & Growth Tracker

A comprehensive, unified productivity management dashboard designed to help users track habits, tasks, goals, and learning sessions in one place.

## Features

- **Unified Dashboard**: View habits, tasks, goals, learning progress, and daily performance in one place.
- **Daily Performance Score**: Track overall productivity using a weighted daily scoring system (Habits %, Tasks %, Learning %).
- **Habit Tracking**: Monitor habits, completion progress, and streaks with a 7-day visual consistency matrix.
- **Task Management**: Organize tasks using a 4-column Kanban-style workflow (`To Do`, `In Progress`, `In Review`, `Done`) with drag-and-drop status updates.
- **Goal Tracking**: Track goals, milestones, auto-balanced point allocations, and overall completion progress.
- **Learning Sessions**: Record and monitor focused study and learning sessions with notes and duration.
- **Focus Mode**: Built-in Pomodoro timer for focused work and study sessions with audio cues and direct progress logging.
- **Progress Insights**: View weekly productivity trends and metric breakdowns via interactive charts.
- **Overdue Task Alerts**: Identify past-due tasks and critical score warnings with actionable alerts.
- **Customizable Settings**: Configure scoring formula weights, theme/accent preferences, notification toggles, and manage data.
- **Data Persistence**: Offline-ready data persistence in browser `localStorage`.
- **Reset to Template**: Restore the application to the default starter dataset at any time.

## Tech Stack

### Frontend

- **React.js 18** (Components, Hooks, Context API)
- **Vite** (Fast modern development and build tooling)
- **Tailwind CSS** (Modern utility-first styling with Moody Dark UI aesthetics)
- **Framer Motion** (Smooth UI transitions and interactive layout animations)
- **Recharts** (Productivity trend charts with custom gradient fills and tooltips)
- **Lucide React** (Consistent icon system)
- **Date-fns** (Date manipulation and streak formatting)
- **JavaScript (ES6+)**

### Backend / Data

- **REST APIs** (Node.js / Express backend with JWT authentication)
- **Browser Local Storage** (Offline-first persistence and standalone demo mode)

### AI-Assisted Development

- **Cursor**
- **Antigravity**

AI-assisted development tools were used to support architecture design, implementation, debugging, code refinement, and feature development.

---

## Dashboard Modules

### 1. Productivity Dashboard
Provides a unified overview of:
- **Daily performance score**: Weighted composite score (0–100%) with grade indicators.
- **Habit quick check-in strip**: Mark off today's habits with one click directly from the dashboard.
- **Task completion**: Live count of finished tasks and remaining action items.
- **Goal progress**: Progress across active targets and roadmap milestones.
- **Learning activity**: Summary of minutes logged and session notes.
- **Weekly productivity trends**: Interactive area chart for 7-day performance tracking.

### 2. Habit Management
- Daily habit check-ins with one-click toggles.
- Streak tracking (🔥 current streak and all-time best streak).
- 7-day consistency dot matrix for every habit.
- Categorization (Productivity, Learning, Health, Engineering, Mindset).

### 3. Task Management (Kanban Board)
- 4-column Kanban board: `To Do`, `In Progress`, `In Review`, and `Done`.
- Drag-and-drop status updates across workflow stages.
- Timeline/List view toggle.
- Overdue task identification with warning badges.
- Filtering by date (Today, This Week, Overdue) and priority (High, Medium, Low).

### 4. Goal & Learning Tracking
- Long-term goal progress monitoring (0–100%).
- Milestone tracking with auto-rebalancing point values or custom allocations.
- Learning session logging with duration, topic, and key takeaways.
- Focus session tracking via the built-in Pomodoro timer.

---

## Data Persistence & Template Management

Manage productivity data with template reset options.

- **Reset to Template**
  Restore the application to the default starter dataset.

> **Note:** Resetting the template re-populates habits, Kanban tasks, goal roadmaps, and focus logs with the default starter data.

Users can access this option via:

```text
Settings → Reset to Template
```

Or from the topbar profile dropdown:

```text
Profile Menu → Reset to Template
```

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
│   │   │   └── storage.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── package.json
├── package.json
└── README.md
```

---

## Getting Started

### 1. Install Dependencies

```sh
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Run in Development Mode

Run the frontend client:

```sh
npm run client:dev
```

Or start both backend and frontend concurrently:

```sh
npm run dev
```

### 3. Open in Browser

Navigate to `http://localhost:5173`. You can immediately click **"Continue as Guest / Demo Mode"** to explore all dashboard features with pre-populated template data!

---

## License

MIT License
