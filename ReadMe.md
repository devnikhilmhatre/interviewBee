# Job Hunter MVP

## Overview

Job Hunter MVP is a simple web application that:

- Crawls a public job site using **Playwright**.
- Stores jobs in a local **database** (SQLite via Sequelize).
- Displays jobs in a **React/Next.js frontend** with search, filters, and pagination.
- Each job has an **Apply** button linking to the original posting.

---

## Prerequisites

- Node.js >= 18
- npm
- Supported database (SQLite)
- Playwright installed (via npm dependencies)

---

## Setup

1. **Install dependencies**:

```bash
npm install
```

2. **Run migrations**:

```bash
node backend/src/database/migrate.js
```

The `migrate.js` script **re-initializes** the database by dropping and recreating all tables, then pre-populates the sites table with the configured job site selectors for the crawler to use.

---

## Running the Crawler

1. **Start the crawler**:

```bash
node backend/crawler/index.js
```

2. **Select a site** from the prompt.
   The crawler will fetch job listings, skip jobs already in the database, and save new jobs.

3. **Notes**:

- Infinite scroll sites are handled safely in batches.

---

## Running the Backend (Express API)

1. **Start the server**:

```bash
node backend/server/index.js
```

2. **API endpoint**:

```
GET /jobs
```

**Query parameters:**

- `q` → keyword q on title or company
- `company` → filter by company
- `location` → filter by location
- `page` → pagination page number
- `limit` → number of results per page

Example:

```
http://localhost:3000/jobs?q=engineer&location=Remote&page=1&limit=10
```

---

## Running the Frontend (React/Next.js)

1. **Start frontend**:

```bash
cd frontend
npm run dev
```

2. Open your browser at:

```
http://localhost:5173/
```

3. Features:

- Job list with **Apply** link
- **Keyword search**
- **Filters** for company and location
- **Pagination**

> Ensure the backend API is running and accessible at the expected port.

---

## Notes / Assumptions

- Local run only; no hosting required.
- Infinite scroll is batched to prevent memory overflow.
- The crawler skips URLs already present in the database.
<!-- - Job details fetching is currently sequential for safety; parallel fetching via `Promise.all` is possible but not used to avoid potential site restrictions or domain issues. -->

---
