# ParkOps

ParkOps is a full-stack digital parking and gate control system with secure
administrator authentication, real-time VIP and Normal parking availability,
vehicle entry and exit workflows, soft-deleted parking history, and immutable
audit logs.

## Start locally

Use two terminals from the project root.

Backend:

```bash
cd Backend
cp .env.example .env
# Add your MongoDB Atlas URI and a private JWT secret to .env
npm install
npm run dev
```

Frontend:

```bash
cd Client
npm install
npm run dev
```

Open `http://localhost:5173`, choose **Create first admin**, and create the
initial administrator. After that, first-time setup is locked and normal login
is required.

## Business workflows

- **Home:** live capacity, occupied/free totals, utilization, separate VIP and
  Normal availability, daily gate flow, and recent activity.
- **Entry:** select VIP or Normal parking, choose only a currently available
  slot, and record a unique vehicle number, type, and phone number.
- **Exit:** find an active vehicle, confirm exit, release its slot, and retain
  the parking record as a soft-deleted `EXITED` session.
- **Logs:** search, filter, paginate, and export the complete administrator,
  entry, and exit audit trail.

See `Backend/README.md` and `Client/README.md` for service-specific details.
