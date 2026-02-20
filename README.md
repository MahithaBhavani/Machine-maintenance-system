# MantisAI — Machine Maintenance Scheduler

> **Microservices-based industrial machine maintenance platform** with Firebase Firestore persistence, real-time risk prediction, and a premium dark-themed dashboard.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (Port 5000)                │
│              HTML + Vanilla JS Dashboard             │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────┐
│              API Gateway  (Port 3000)                │
│         Routes all requests to microservices         │
└────┬──────────────┬──────────────┬──────────────────┘
     │              │              │
     ▼              ▼              ▼
┌─────────┐  ┌───────────┐  ┌────────────────┐
│ Machine │  │   Task    │  │   Scheduler    │
│ Service │  │  Service  │  │    Service     │
│ :8001   │  │  :3002    │  │    :3003       │
└────┬────┘  └─────┬─────┘  └────────────────┘
     │             │
     ▼             ▼
┌─────────────────────────────────────────────────────┐
│               Firebase Firestore (Cloud DB)          │
│         Collections: machines | tasks                │
└─────────────────────────────────────────────────────┘
```

---

## Prerequisites

- **Node.js** v18+
- **Firebase Project** with Firestore enabled

---

## Firebase Setup (One-Time)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project → Enable **Firestore Database** (production mode)
3. Go to **Project Settings → Service Accounts → Generate new private key**
4. Download the JSON file and rename/save it as:
   ```
   firebase-service-account.json   ← place in project root
   ```

> ⚠️ **Never commit `firebase-service-account.json` to version control!**

---

## Installation

```cmd
cd "machine-maintenance-microservices - Copy (2)"
npm install
```

---

## Seed the Database (First Run Only)

```cmd
node seed.js
```

This populates Firestore with **12 machines** and **22 maintenance tasks**.

---

## Running the Application

### Start all 4 microservices at once (recommended):
```cmd
npm start
```

### Or start each service individually:
```cmd
node gateway/server.js          # API Gateway     → http://localhost:3000
node machine-service/server.js  # Machine Service → http://localhost:8001
node task-service/server.js     # Task Service    → http://localhost:3002
node scheduler-service/server.js # Scheduler      → http://localhost:3003
```

### Serve the Frontend:
```cmd
npx serve frontend
```
Open **http://localhost:3000** (or whatever port `serve` shows).

---

## API Reference

All requests go through the gateway at `http://localhost:3000`.

### Machines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/machines` | Get all machines |
| GET | `/machines/:id` | Get machine by ID |
| POST | `/machines` | Add new machine |
| PUT | `/machines/:id` | Update machine |
| DELETE | `/machines/:id` | Delete machine |

**POST/PUT body:**
```json
{
  "name": "Press 101",
  "location": "Plant 1-S",
  "interval": 30,
  "status": "Operational",
  "lastMaintenance": "2025-12-01"
}
```

---

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/upcoming` | Get upcoming non-completed tasks |
| GET | `/tasks/overdue` | Get overdue non-completed tasks |
| GET | `/tasks/machine/:id` | Get tasks for a specific machine |
| GET | `/tasks/:id` | Get single task |
| POST | `/tasks` | Schedule new task |
| PUT | `/tasks/:id` | Update task (status, notes, etc.) |
| DELETE | `/tasks/:id` | Delete task |

**POST body:**
```json
{
  "machineId": "1",
  "description": "Replace hydraulic oil",
  "scheduledDate": "2026-03-15",
  "priority": "High",
  "notes": "Use Shell Tellus oil"
}
```

---

### Scheduler / Risk Predictor

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/predict/:interval` | Get risk tier for a given interval (days) |
| POST | `/assess` | Bulk risk assessment for multiple machines |

**Risk Tiers:**
| Interval | Risk Level |
|----------|------------|
| < 10 days | 🔴 Critical |
| 10–19 days | 🟠 High |
| 20–34 days | 🟡 Moderate |
| ≥ 35 days  | 🟢 Low |

---

### Gateway

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Gateway health check |

---

## Microservice Ports

| Service | Port | Responsibility |
|---------|------|----------------|
| API Gateway | 3000 | Single entry point, routes all requests |
| Machine Service | 8001 | CRUD for machines, Firestore `machines` collection |
| Task Service | 3002 | CRUD for tasks, Firestore `tasks` collection |
| Scheduler Service | 3003 | Risk prediction, fleet health assessment |
| Frontend (serve) | 5000 | Static HTML/JS dashboard |

---

## Features

- ✅ **Dashboard** — stat cards (total machines, pending/overdue/completed tasks), upcoming and overdue task panels
- ✅ **Machine Management** — add, view, delete machines; view machine-specific task history
- ✅ **Task Management** — schedule, update status, delete tasks; filter by status
- ✅ **Upcoming Tasks** — real-time view of future scheduled maintenance
- ✅ **Risk Predictor** — manual interval check + automated fleet-wide risk report
- ✅ **Firebase Persistence** — all data survives service restarts
- ✅ **Toast Notifications** — success/error feedback on all actions
- ✅ **Connection Status Indicator** — live gateway health in sidebar
- ✅ **Premium Dark UI** — glassmorphism, Inter font, micro-animations

---

## Project Structure

```
machine-maintenance-microservices/
├── firebase-config.js          ← Shared Firestore init (all services use this)
├── firebase-service-account.json  ← 🔑 YOUR KEY (not committed)
├── seed.js                     ← One-time data seeder
├── package.json                ← npm scripts + dependencies
│
├── gateway/
│   └── server.js               ← API Gateway (port 3000)
│
├── machine-service/
│   └── server.js               ← Machine CRUD (port 8001)
│
├── task-service/
│   └── server.js               ← Task CRUD (port 3002)
│
├── scheduler-service/
│   └── server.js               ← Risk predictor (port 3003)
│
└── frontend/
    ├── index.html              ← Dashboard UI
    └── app.js                  ← Frontend logic
```
