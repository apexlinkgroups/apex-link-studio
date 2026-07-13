# APEX LINK Studio

Full-stack workspace for the APEX LINK Studio public frontend, admin panel, and Express/MongoDB backend.

## Apps

- `apps/frontend` - customer-facing Vite/React app on port `5173`
- `apps/admin` - admin Vite/React app on port `5174`
- `apps/backend` - Express API on port `5000`

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create backend environment file:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

3. Fill in `apps/backend/.env` with MongoDB, JWT, Cloudinary, Stripe, and email credentials.

4. Optional frontend environment files:

   ```bash
   cp apps/frontend/.env.example apps/frontend/.env
   cp apps/admin/.env.example apps/admin/.env
   ```

5. Run all apps:

   ```bash
   npm run dev
   ```

Frontend: `http://localhost:5173`
Admin: `http://localhost:5174`
Backend health check: `http://localhost:5000/api/health`

## Production Build

```bash
npm run build
```

The build command compiles both Vite apps. The backend runs with:

```bash
npm start
```
