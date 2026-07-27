# ParkOps API

Express and MongoDB Atlas API for the ParkOps parking and gate control system.

## Setup

1. In MongoDB Atlas, create a database user and add your current IP address
   under **Network Access**.
2. Copy `.env.example` to `.env`.
3. Replace `MONGODB_URI` with the Atlas connection string and replace
   `JWT_SECRET` with a unique random value of at least 32 characters.
4. Install and start the API:

   ```bash
   npm install
   npm run dev
   ```

`npm run dev` intentionally uses the normal Node process because recursive
watch mode can exceed the macOS open-file limit in dependency-heavy projects.
Restart the command after changing backend files.

The API runs on `http://localhost:5001` by default. Check
`GET /api/health` to confirm the Atlas connection.

## Authentication

Use **Create first admin** on the frontend the first time the system runs. The
public setup endpoint closes automatically after an administrator exists.
Subsequent access requires an email, password, and signed JWT.

## Main API routes

- `POST /api/auth/register` — create the first administrator only
- `POST /api/auth/login` — administrator login
- `GET /api/auth/me` — restore the current session
- `GET /api/dashboard` — live capacity and activity summary
- `GET /api/parking/availability` — available VIP or Normal slots
- `GET /api/parking/slots` — complete VIP and Normal slot map
- `GET/POST /api/parking/entries` — list or create active entries
- `POST /api/parking/entries/:id/exit` — soft-delete an active entry
- `GET /api/gates/emergency` — current emergency-gate state and activity
- `POST /api/gates/emergency/open` — open the emergency gate
- `POST /api/gates/emergency/close` — close the emergency gate
- `GET /api/logs` — paginated and searchable audit logs

Parking changes and their audit records use a MongoDB transaction. Vehicle
numbers and slots are uniquely constrained while active, protecting against
concurrent double bookings.

Emergency-gate endpoints provide the authenticated digital command and state
layer. Connecting that command to a physical barrier requires the barrier
controller's relay, PLC, or vendor API specification.
