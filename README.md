# 📎 Paperclip Clone

A lightweight, beautiful **AI agent orchestration dashboard** inspired by [Paperclip](https://paperclip.ing).

> **If OpenClaw is an employee, Paperclip is the company.**  
> This clone gives you the control plane: org charts, goals, budgets, tasks, live activity, and simulation.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## Features

- **Dashboard** — Mission overview, live stats, activity feed + **Simulate Tick**
- **Agents** — Hire, search/filter, pause/resume, budgets, skills, delete
- **Goals** — Create, track progress, delete
- **Tasks** — Full Kanban (create, assign, priority, delete, status workflow)
- **Org Chart** — Hierarchical view with live status indicators + budget tooltips
- **Settings** — Edit company name & mission, **auto-simulate toggle**, reset demo
- **Keyboard shortcuts**
  - `S` → Simulate Tick
  - `G` then `D / A / T / O / G / S` → navigate pages
- **Live simulation** — Manual or automatic (every 4s) agent activity
- **Persistent state** — localStorage survives refresh (with `isHydrated` guards on every page)
- **Skeleton loading** — polished pulse placeholders while state hydrates
- **Mobile responsive** — Hamburger sidebar, adaptive layout
- **Accessible** — Focus rings, ARIA labels, keyboard friendly
- **Dark, modern UI** — Tailwind CSS v4

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

This project is ready for one-click Vercel deployment.

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `henrygoldsmith07-wq/paperclip-clone`
3. Click **Deploy**

No environment variables required.

## Keyboard Shortcuts

| Shortcut     | Action              |
|--------------|---------------------|
| `S`          | Simulate Tick       |
| `G` then `D` | Dashboard           |
| `G` then `A` | Agents              |
| `G` then `T` | Tasks               |
| `G` then `O` | Org Chart           |
| `G` then `G` | Goals               |
| `G` then `S` | Settings            |

## Project Structure

```
src/
├── app/dashboard/
│   ├── page.tsx          # Overview + Simulate Tick
│   ├── agents/           # Agent management
│   ├── goals/            # Goals
│   ├── tasks/            # Kanban board
│   ├── org/              # Org chart
│   └── settings/         # Company settings + auto-simulate
├── components/           # UI components + KeyboardShortcuts + Skeleton
├── context/AppContext.tsx
└── lib/                  # Types & seed data
```

## Recent Improvements

- Fixed Next.js hydration mismatch via `isHydrated` guard in AppContext + all dashboard pages.
- Fixed runtime error on Tasks page (`addTask` → `createTask`).
- Full skeleton loading states on Dashboard, Agents, Goals, Tasks, and Org Chart.
- Enriched seed activity feed for a more realistic demo experience.

## License

MIT

---

Built as a clone of [paperclipai/paperclip](https://github.com/paperclipai/paperclip)
