# ParkOps dashboard

React and Vite administrator dashboard for the ParkOps gate control system.

## Development

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:5173` and proxies `/api`
requests to the backend at `http://localhost:5000`.

Available commands:

- `npm run dev` — start the frontend development server
- `npm run lint` — run Oxlint
- `npm run build` — create the production build
- `npm run preview` — preview the production build

For a separately hosted backend, copy `.env.example` to `.env` and set
`VITE_API_URL` to the deployed API URL ending in `/api`.
