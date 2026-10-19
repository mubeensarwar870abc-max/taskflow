# TaskFlow — Collaborative Project Management Platform

A modern, production-minded collaborative project management platform inspired by **Trello** and **Asana**. TaskFlow empowers individuals and teams to organize complex work, collaborate on project boards, assign tasks, communicate through real-time discussions, track sprint progress, and receive instant notifications.

The visual design language is inspired by the modern rounded SaaS aesthetic featuring a vertical purple pill navigation sidebar, rounded card containers, a vibrant overview velocity wave chart, stacked sprint and focus widgets, Kanban drag-and-drop boards, and a live activity stream.

---

## 📸 Design Language & Palette

- **Primary Purple**: `#6D5BD0` / `#5B4DBF`
- **Secondary Purple**: `#8B7CF6`
- **Primary Blue**: `#3B82F6`
- **Accent Pink / Rose**: `#EC4899` / `#F43F5E`
- **Light Lavender Bezel**: `#ECEBFA` / `#F1EEFF`
- **Light Card Surface**: `#FFFFFF` / `#FAFAFE`
- **Dark Mode Background**: `#0C0F1D` / `#12162B`
- **Dark Mode Surface**: `#161B30` / `#191E35`

---

## 🚀 Key Features

1. **User Authentication & Authorization**:
   - Secure registration, login, and password hashing using `bcryptjs`.
   - JWT tokens with HTTP-only cookies and Bearer token support.
   - Resource-level authorization middleware preventing unauthorized access to private projects or tasks.
2. **Dashboard Overview**:
   - Reproduces the reference layout with live database calculations.
   - Interactive SVG/Recharts velocity wave chart with month/week views.
   - Key sprint statistics (logged time, tasks completed, sprint goals).
   - Stacked Sprint Velocity card and Radiant Pink Focus Tasks card.
   - Project progress cards with progress bars and status chips (`14/20 tasks`, `2 days left`).
   - Right-side collaboration panel with team member status and real-time activity stream.
3. **Interactive Kanban Boards**:
   - 5 standard columns: **Backlog**, **To Do**, **In Progress**, **In Review**, **Done**.
   - HTML5 drag-and-drop status transitions with instant MongoDB persistence.
   - Filter by search query and priority (Urgent, High, Medium, Low).
   - Quick task creation directly in any column.
4. **Task Detail View & Discussions**:
   - Slide-out / modal interface for comprehensive task editing.
   - Title, description, status, priority, due date, assignees, checklist items, and tags.
   - Real-time comment threads powered by Socket.IO.
5. **Real-Time Collaboration (Socket.IO)**:
   - Authenticated WebSocket handshakes with JWT verification.
   - Dedicated project rooms (`project:<id>`) and user rooms (`user:<id>`).
   - Live updates for task creation, column shifts, edits, comments, and project membership changes.
6. **Persistent Notifications**:
   - Stored in MongoDB; delivered instantly via WebSockets to online users.
   - Unread badge counter, individual mark-as-read, and "Mark all as read" controls.
7. **My Tasks & Calendar View**:
   - Dedicated "My Tasks" page with status tabs and sorting by due date, priority, or title.
   - Monthly project calendar plotting task due dates with priority-coded badges.
8. **Team Directory & Settings**:
   - Member management, role assignments (Admin, Member, Viewer).
   - Profile settings, image avatar URL, password change, and light/dark theme toggle.

---

## 🛠 Technology Stack

### Frontend
- **React.js 18** with **Vite**
- **TypeScript**
- **Tailwind CSS** with custom dark mode and theme tokens
- **React Router v6**
- **Lucide React** (modern iconography)
- **Recharts** (velocity and analytics visualization)
- **Socket.IO Client** (real-time updates)

### Backend
- **Node.js** & **Express.js**
- **TypeScript**
- **MongoDB** & **Mongoose ODM**
- **Socket.IO** (room-based WebSocket architecture)
- **Zod** (runtime request validation)
- **jsonwebtoken** & **bcryptjs** (authentication)
- **Jest** & **Supertest** (automated test suites)

---

## 📂 Project Structure

```
codeproject/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and environment configuration
│   │   ├── controllers/     # Auth, User, Project, Task, Comment, Notification, Dashboard
│   │   ├── middleware/      # JWT auth, project permissions, Zod validation, error handler
│   │   ├── models/          # User, Workspace, Project, Task, Comment, Notification, Activity
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Socket.IO emitter, notification & activity services
│   │   ├── sockets/         # Socket.IO authenticated room management
│   │   ├── utils/           # Database seeder (seed.ts) & E2E verifier (verifyE2E.ts)
│   │   ├── validators/      # Zod validation schemas
│   │   ├── app.ts           # Express application setup
│   │   └── server.ts        # HTTP & Socket.IO server entrypoint
│   ├── tests/
│   │   ├── auth.test.ts
│   │   └── projects_tasks.test.ts
│   ├── .env.example
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── board/       # KanbanBoard, KanbanColumn, TaskCard
│   │   │   ├── common/      # Avatar, Badge, Button, Input, Modal
│   │   │   ├── dashboard/   # OverviewWidget, SprintCard, PriorityCard, ProjectCard, RightCollaborationPanel
│   │   │   ├── layout/      # AppShell, Sidebar, Header
│   │   │   ├── modals/      # CreateTaskModal, CreateProjectModal, InviteMemberModal, TaskDetailModal
│   │   │   └── notifications/# NotificationDropdown
│   │   ├── context/         # AuthContext, SocketContext, ThemeContext
│   │   ├── pages/           # Dashboard, Projects, ProjectBoard, MyTasks, Calendar, Team, Settings, Login, Register
│   │   ├── services/        # api.ts, socket.ts
│   │   ├── types/           # index.ts (TypeScript interfaces)
│   │   ├── App.tsx          # Router configuration
│   │   ├── main.tsx         # Entrypoint
│   │   └── index.css        # Tailwind styles & theme variables
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** (v18+ recommended, verified on v20.19.4)
- **npm** (v9+ recommended, verified on 10.8.2)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI.

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env
cp .env.example .env
```

Default `.env` configuration:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=taskflow_super_secret_jwt_key_2026_antigravity_dev
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### Seed Demo Data (Optional but recommended)
Populates users, workspaces, projects with velocity metrics, tasks, and comments:
```bash
npm run seed
```
Demo accounts created:
- **Email**: `alex@taskflow.dev` | **Password**: `password123` (Admin / Project Lead)
- **Email**: `max@taskflow.dev` | **Password**: `password123`
- **Email**: `grisha@taskflow.dev` | **Password**: `password123`

#### Start Backend Server
```bash
# Development mode with hot-reload:
npm run dev

# Or build and run production:
npm run build
npm start
```
The server will run on `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The application will be accessible at **`http://localhost:5173`**.

---

## 🧪 Running Tests

### Backend Unit & Integration Tests (Jest & Supertest)
```bash
cd backend
npm test
```
Tests 12 automated scenarios covering registration, login, token authentication, duplicate prevention, password validation, project access control, task status shifts, and comments.

### End-to-End Acceptance Verification
```bash
cd backend
npx ts-node --transpile-only src/utils/verifyE2E.ts
```
Executes all **16 comprehensive end-to-end acceptance tests** specified in Section 31 of the specifications.

---

## 💡 How to Use TaskFlow

1. **Sign In**: Navigate to `http://localhost:5173`. Click the **⚡ Auto-fill Demo Account** button or create a new user.
2. **Dashboard**: View the velocity chart, sprint statistics, recent activity, and active projects.
3. **Create a Project**: Click **+ New Project** in the top header or on the Projects page. Choose a theme color, description, and target dates.
4. **Kanban Board**: Click any project to open its board. Drag and drop tasks between **Backlog**, **To Do**, **In Progress**, **In Review**, and **Done**.
5. **Real-Time Collaboration**: Open two different browser windows (e.g. Chrome and Edge or an Incognito window) with different accounts (`alex@taskflow.dev` and `max@taskflow.dev`). Add comments or move tasks on one screen and watch them instantly update on the other!
6. **Task Detail Modal**: Click any task card to edit its description, check off sub-items, assign team members, add labels, or post comments.
7. **Calendar**: Navigate to the Calendar in the sidebar to view tasks plotted against their due dates.
8. **Theme Toggle**: Click the Sun/Moon icon in the top header to toggle between light and dark modes.
