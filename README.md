<div align="center">

<img src="frontend/public/logo.svg" alt="krate logo" width="110" />

# krate

**Personal Media Ownership Vault**

A sleek, dark-mode cataloging application for organizing, browsing, and tracking everything you own across physical shelves and digital storefronts.

[![React](https://img.shields.io/badge/React-19-338CFF?logo=react&logoColor=white)](#)
[![Vite](https://img.shields.io/badge/Vite-7-38BDF8?logo=vite&logoColor=white)](#)
[![MUI](https://img.shields.io/badge/Material_UI-v7-1F6FEB?logo=mui&logoColor=white)](#)
[![Express](https://img.shields.io/badge/Express-Node.js-161922?logo=express&logoColor=white)](#)
[![SQLite](https://img.shields.io/badge/SQLite-Local_DB-0d0f14?logo=sqlite&logoColor=38BDF8)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## ✨ Overview

**krate** gives collectors and media enthusiasts a unified, Plex-inspired home for their entire physical and digital library. Whether you collect 4K UHD Steelbooks, vinyl-sized boardgame boxes, game cartridges, hardcover books, or digital licenses across Steam and Apple TV, **krate** keeps track of what you own, which edition it is, and exactly where it lives.

---

## 🌟 Key Features

- **Home Vault Hub** — Unified dashboard featuring collection statistics (total owned, physical vs. digital breakdown, category counts), instant cross-library search, and horizontal media shelves.
- **5 Specialized Media Libraries**
  - 🎬 **Movies & Cinema** — Track 4K UHD Blu-rays, Blu-rays, DVDs, Steelbooks, and digital films with director, release year, runtime, format, edition, and ratings.
  - 📺 **TV Shows & Box Sets** — Catalog complete series box sets, season discs, and digital seasons with network/creator, season & episode counts, and watch status.
  - 🎮 **Videogames** — Manage physical discs, cartridges, collector's editions, and digital storefronts with developer, publisher, platform, and completion status.
  - 📚 **Books & Literature** — Organize hardcovers, paperbacks, first editions, eBooks, and audiobooks with author, ISBN, page count, and publisher metadata.
  - 🎲 **Boardgames & Tabletop** — Track tabletop boxes, expansions, and deluxe editions with designer, min/max players, play time, and complexity weight.
- **Poster Grid & Master Table Views** — Switch at any time between a visual poster wall (with format ribbons, rating badges, and physical/digital pills) and a high-density sortable inventory table.
- **Curated Cross-Media Collections** — Group items into custom themed collections (e.g., *Criterion Collection*, *Signed Editions*, *Sci-Fi Essentials*) with custom cover art.
- **Physical Shelf & Digital Storefront Tracking** — Assign custom platforms (*PlayStation 5*, *Nintendo Switch*, *Steam*, *Kindle*), formats (*4K UHD*, *Steelbook*, *Hardcover*), and shelf locations (*Living Room Rack*, *Kallax Row 2*).
- **Cover Art Uploads & External URLs** — Upload local cover images (stored via `multer`) or link external poster URLs.
- **One-Click Vault Backup & Export** — Export your entire catalog as a `.CSV` spreadsheet (for Excel / Google Sheets) or download a complete `.JSON` vault snapshot from **Vault Settings**.

---

## 🚀 Getting Started (How to Launch)

### Prerequisites

- **Node.js** `v18+` (with `npm`)

### 1. Clone & Install Dependencies

From the project root directory, install the root workspace tooling and both the `backend` and `frontend` packages:

```bash
git clone https://github.com/kevindevijlder/medialedger.git
cd MediaLedger

# Install root workspace dependencies (concurrently, fonts)
npm install

# Install backend and frontend dependencies
npm run install-all
```

### 2. Launch the Application (Single Command)

Start both the **Express + SQLite backend** and the **React + Vite frontend** together from the root directory:

```bash
npm run dev
```

Once running:
- **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
- **Backend REST API:** [http://localhost:3001](http://localhost:3001)

> [!NOTE]
> The SQLite database (`backend/medialedger.db`) and all tables/migrations are initialized automatically on first launch by `backend/schema.js`.

### 3. Running Services Individually (Optional)

If you prefer to run the backend and frontend in separate terminals:

```bash
# Terminal 1 — Start Backend API (port 3001)
cd backend
npm run dev

# Terminal 2 — Start Frontend Dev Server (port 5173)
cd frontend
npm run dev
```

To create an optimized production build of the frontend:

```bash
cd frontend
npm run build
npm run preview
```

---

## 📦 Folder Structure

```text
MediaLedger/
├── package.json                 # Root workspace config & concurrent dev script
├── backend/                     # Node.js + Express REST API
│   ├── server.js                # Express app entry point (Port 3001)
│   ├── db.js                    # SQLite connection helper
│   ├── schema.js                # Automatic table creation & schema migrations
│   ├── medialedger.db           # Local SQLite database file
│   ├── uploads/                 # Uploaded item & collection cover images
│   └── routes/                  # Modular REST API endpoints
│       ├── vault.js             # Unified vault stats, platforms, formats & tags
│       ├── movies.js            # Movies CRUD & cover uploads
│       ├── tvshows.js           # TV Shows CRUD & cover uploads
│       ├── videogames.js        # Videogames CRUD & cover uploads
│       ├── books.js             # Books CRUD & cover uploads
│       ├── boardgames.js        # Boardgames CRUD & cover uploads
│       └── collections.js       # Custom collections & item assignments
└── frontend/                    # React 19 + Vite + Material UI (MUI v7)
    ├── index.html               # App shell & dark scrollbar styling
    ├── public/
    │   └── logo.svg             # krate Media Tray vector favicon
    └── src/
        ├── main.jsx             # MUI dark theme (#0d0f14 / #338CFF) & router setup
        ├── App.jsx              # Layout shell, collapsible sidebar & route table
        ├── AppContext.jsx       # Global state & toast notifications
        ├── api/
        │   └── client.js        # API base URL & cover URL resolver
        ├── assets/
        │   ├── logo.png         # Full krate brand lockup banner
        │   └── logosmall.png    # Sidebar app icon (512×512)
        └── components/
            ├── Sidebar.jsx      # Collapsible navigation sidebar
            ├── Dashboard.jsx    # Home Vault hub, stats & search filters
            ├── create.jsx       # Quick category selector for adding media
            ├── configuration.jsx# Platforms, formats, shelf tags & CSV/JSON export
            ├── common/
            │   └── PlexComponents.jsx # Poster cards, inventory table, detail hero & forms
            ├── collection/      # Collection grid, creation & detail views
            └── displays/        # Category views (movie, tvshow, videogame, book, boardgame)
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 7, React Router 7 | Fast SPA routing and component rendering |
| **UI & Styling** | Material UI (MUI v7), Emotion, Ubuntu & Roboto fonts | Dark obsidian (`#0d0f14`) & electric blue (`#338CFF`) design system |
| **Backend** | Node.js, Express 4, Multer, CORS | RESTful API and local cover image uploads |
| **Database** | SQLite3 (`sqlite3`) | Zero-configuration local relational storage |

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
