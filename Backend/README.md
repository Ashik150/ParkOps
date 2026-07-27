# ParkOps backend

## MongoDB Atlas setup

1. In Atlas, create a database user and allow your current IP address under
   **Network Access**.
2. Copy `.env.example` to `.env`.
3. Replace the placeholder `MONGODB_URI` with the connection string from
   Atlas. URL-encode special characters in the username or password.
4. Start the API:

   ```bash
   npm start
   ```

The server connects to Atlas before accepting requests. Once running, check
`GET http://localhost:5000/api/health`; it returns `database: "connected"` when
the connection is healthy.

Never commit `.env`; it is excluded by `.gitignore`.
