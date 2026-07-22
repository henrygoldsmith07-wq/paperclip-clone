# 📎 Paperclip Clone

A lightweight, beautiful **AI agent orchestration dashboard** inspired by [Paperclip](https://paperclip.ing).

> **If OpenClaw is an employee, Paperclip is the company.**  
> This clone gives you the control plane: org charts, goals, budgets, tasks, live activity, and simulation.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## Features

- **Dashboard** — Mission overview, live stats, **budget alerts**, activity feed with clear
- **Agents** — Hire, search/filter, pause/resume, **Pause all / Resume all**, budgets, skills, delete
- **Goals** — Create, track progress, delete
- **Tasks** — Full Kanban with **search**, **priority filter**, create, assign, delete, status workflow
- **Org Chart** — Hierarchical view with live status indicators + budget tooltips
- **Settings** — Company identity, auto-simulate, **export/import JSON**, **reset budgets**, clear activity, reset demo
- **Toast notifications** — Feedback on simulate, hire, delete, import/export
- **Global Simulate** — Header button + keyboard `S` on every page
- **Keyboard shortcuts** — `S` simulate · `G` then `D / A / T / O / G / S` navigate
- **Live simulation** — Manual or automatic (every 4s) agent activity
- **Persistent state** — localStorage survives refresh (with `isHydrated` guards)
- **Skeleton loading** — on every dashboard page while state hydrates
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
│   ├── page.tsx          # Overview + budget alerts
│   ├── agents/           # Agent management
│   ├── goals/            # Goals
│   ├── tasks/            # Kanban board
│   ├── org/              # Org chart
│   └── settings/         # Identity, export/import, budgets
├── components/           # UI + KeyboardShortcuts + Skeleton + Toast
├── context/AppContext.tsx
└── lib/                  # Types & seed data
```

## Recent Improvements

- Full skeleton coverage (Agents + Settings included).
- Dashboard budget alerts for agents at ≥70% spend.
- One-click **Reset Budgets** without wiping company data.
- Clear activity from the dashboard feed header.
- Removed duplicate Simulate control (Header is the single source).

## License

MIT

---

Built as a clone of [paperclipai/paperclip](https://github.com/paperclipai/paperclip)
