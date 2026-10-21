# Foundation Tracker

A full-stack habit tracker built around a personal floor/ceiling system — the smallest version of a habit that still counts as a win, plus a stretch goal for good days. Built solo, end to end: schema design, REST API, and frontend.

**Live app:** [foundation-tracker-pro.vercel.app](https://foundation-tracker-pro.vercel.app/)

---

## Why I built this

I kept falling off with the habits I cared about like gym, job applications, skincare, winding down at night because most trackers are all or nothing, and one bad day would wreck the streak and I'd just quit. So I built this around a floor/ceiling system instead: a minimum that still counts as a win, and a stretch goal for the days I have more in me. I found a problem I had and built an end to end project that solved that problem and helped me keep my skills stay sharp.

## Features

- **Daily log** — click-to-toggle floor/ceiling states for each habit, with optimistic UI updates

<img width="775" height="520" alt="Screenshot 2026-10-13 at 9 56 43 PM" src="https://github.com/user-attachments/assets/14f99655-cc51-4311-a91e-3ad2d6402426" />
  
- **Log any past day** — step back a day at a time or pick a date, and each day loads (or starts blank) independently
- **Cold-start loading screen** — the frontend pings a health endpoint on load and shows a loading state while the free-tier backend wakes up, so the landing page never waits on it
- **Daily note** — a short reflection field for each day
- **Weekly snapshot** — a calendar-week grid (Monday–Sunday) showing the last week's pattern at a glance, with navigation to browse past weeks
  
<img width="772" height="553" alt="Screenshot 2026-10-13 at 9 57 48 PM" src="https://github.com/user-attachments/assets/0df68c51-d3ab-430f-a442-1e7e1bdd4497" />

- **Password-protected personal guide** — a private reference page, gated server-side so the content never ships in the public bundle
- **Recruiter-facing landing page** — project overview, skills, and links

## Tech stack

**Frontend:** React (Vite), React Router, react-markdown
**Backend:** Node.js, Express, Mongoose
**Database:** MongoDB (Atlas)
**Deployment:** Vercel (frontend), Render (backend)

## Architecture notes

- REST API with a single `entries` collection — one document per day, with upsert semantics so a day's record is created on first write rather than needing a separate create step
- Date-range queries (`GET /api/entries?start=&end=`) power the weekly snapshot, with missing days defaulted client-side rather than backfilled server-side
- The password-gated guide page keeps its content server-side only, loaded from an environment variable, so neither the password nor the content are ever present in the public frontend bundle or repo

## Project structure

```
foundation-tracker/
├── client/          React frontend (Vite)
│   └── src/
│       ├── pages/   One component per route
│       └── App.jsx  Routing
└── server/          Express backend
    ├── models/      Mongoose schemas
    └── routes/      API route handlers
```

## Running locally

```bash
# Backend
cd server
npm install
# add a .env with MONGO_URI, GUIDE_PASSWORD, GUIDE_CONTENT
npm run dev

# Frontend (separate terminal)
cd client
npm install
# add a .env with VITE_API_URL=http://localhost:5000
npm run dev
```

## Roadmap

- Dark mode
- AI-assisted weekly reflections via the Claude API