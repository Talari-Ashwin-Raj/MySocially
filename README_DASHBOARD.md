# Marketing Analytics Dashboard

A professional, full-stack marketing dashboard built with Node.js, SQLite, and React.

## Features

- **KPI Overview**: Instant visibility into Total Spend, Revenue, Conversions, and ROAS.
- **Trend Visualization**: Interactive area charts showing revenue vs. spend growth.
- **Channel Performance**: Sortable table with color-coded ROAS indicators (Green > 4.0, Red < 2.0).
- **Strategic Insights**: Automated recommendations based on campaign efficiency metrics.

## Tech Stack

- **Backend**: Node.js, Express, better-sqlite3
- **Frontend**: React, Vite, Recharts, Lucide Icons
- **Database**: SQLite (local, no setup required)

## Getting Started

### 1. Prerequisites
- Node.js 16+
- Part A completed (ensures `summary_data.json` exists)

### 2. Run the Backend
```bash
cd backend
npm install
node server.js
```
The server starts on `http://localhost:5001`.

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

## API Documentation

- `GET /api/summary`: Returns aggregate totals.
- `GET /api/channels`: Returns performance by channel. Supports `sort_by` query param.
- `GET /api/monthly`: Returns revenue/spend trends.
- `GET /api/insights`: Returns strategic recommendations.
