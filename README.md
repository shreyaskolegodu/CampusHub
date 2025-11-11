# Getting Started with Create React App

# CampusHub

## Development

### Environment

- Create a file named `.env.local` in the project root with:

```
REACT_APP_API_BASE_URL=http://localhost:4000
```

### Backend (Express)

Code lives under `server/`. Install deps and start:

````bash
# CampusHub — minimal instructions to run locally

This README lists only what is required to get the project running on a fresh machine.

Prerequisites
- Node.js (16+ recommended) and npm
- MongoDB running locally (or Docker) — the server expects a MongoDB at the URI below

Quick start (minimal, cross-platform)
1. Clone and change directory:

```bash
git clone <repo-url>
cd campushub
````

2. Install project deps (root) and server deps:

```bash
npm install
npm install --prefix server
```

3. (Optional) Create a `.env` file in project root to override defaults (defaults shown):

```
MONGODB_URI=mongodb://localhost:27017/campushub
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
```

4. Start both backend and frontend together (recommended):

```bash
npm start
```

This runs both the Express server and the React dev server in parallel (script uses `concurrently`).

If you want to run only one side:

```bash
npm run start:server   # backend only
npm run start:client   # frontend only
```

Verify

- Backend health: visit or curl: `http://localhost:4000/api/health` → expect `{ "ok": true }`
- Frontend: open `http://localhost:3000`

Common issues & fixes

- Server exits immediately on start — likely MongoDB connection failed. Ensure MongoDB is running.
  - Quick Docker command: `docker run -d --name campushub-mongo -p 27017:27017 mongo:6`
- `concurrently` missing error: run `npm install` (devDependencies need to be installed).
- Port conflicts (3000 or 4000): stop the process using the port (macOS/Linux: `lsof -i :4000` → `kill <pid>`; Windows: use Task Manager or `netstat`/`taskkill`).

Notes

- The `proxy` field in `package.json` points the dev client to `http://localhost:4000` so API calls from the frontend work without CORS changes during development.
- For quick frontend-only work you can run `npm run start:client` and stub/mock API responses if the server is unavailable.

If you want, I can also add a small script to make the server tolerant of a missing MongoDB during frontend-only development (dev-only change). Let me know.

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
