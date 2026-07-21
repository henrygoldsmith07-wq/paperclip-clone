# 📎 Paperclip Clone

A lightweight, beautiful **AI agent orchestration dashboard** inspired by [Paperclip](https://paperclip.ing) — the open-source app for managing teams of AI agents at work.

> **If OpenClaw is an employee, Paperclip is the company.**  
> This clone gives you the control plane: org charts, goals, budgets, tasks, and live activity.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## Features

- **Dashboard** — Mission overview, live stats, activity feed + **Simulate Tick** (live agent activity)
- **Agents** — Hire, search/filter, pause/resume, budgets, skills, delete
- **Goals** — Create, track progress, delete
- **Tasks** — Full Kanban with create, assign, priority, delete, status workflow
- **Org Chart** — Hierarchical view with reporting lines and live status
- **Live simulation** — Simulate Tick advances budgets, tasks, goals and heartbeats
- **Persistent state** — localStorage (survives refresh)
- **Mobile responsive** — Hamburger sidebar, adaptive layout
- **Accessible** — Focus rings, ARIA labels, keyboard friendly
- **Dark, modern UI** — Tailwind CSS v4

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

This project is **ready for one-click Vercel deployment**.

### Option 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option 2: GitHub + Vercel Dashboard

1. This repo is already on GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository `henrygoldsmith07-wq/paperclip-clone`
4. Click **Deploy**

No environment variables required. Pure frontend + localStorage.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **localStorage** for demo persistence

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx          # Overview + Simulate Tick
│   │   ├── agents/page.tsx   # Agent management + search
│   │   ├── goals/page.tsx    # Goals
│   │   ├── tasks/page.tsx    # Kanban
│   │   └── org/page.tsx      # Org chart
│   ├── layout.tsx
│   └── page.tsx              # Redirects to /dashboard
├── components/               # UI components
├── context/AppContext.tsx    # Global state + actions + simulateTick
└── lib/                      # Types & seed data
```

## How it differs from the real Paperclip

This is a **frontend clone / demo** focused on the UX and concepts:

| Feature              | Paperclip (real)          | This clone          |
|----------------------|---------------------------|---------------------|
| Agent runtimes       | Real (Claude, Codex, etc) | Mock / simulated    |
| Database             | Postgres                  | localStorage        |
| Heartbeats           | Real scheduled            | Simulated timestamps|
| Multi-company        | Yes                       | Single company      |
| Auth & governance    | Full                      | Simplified          |

Perfect for learning the product model, demos, or as a starting point to build your own agent control plane.

## License

MIT — do whatever you want.

---

Built with ❤️ as a clone of [paperclipai/paperclip](https://github.com/paperclipai/paperclip)
