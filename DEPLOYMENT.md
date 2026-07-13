# Vercel Deployment

Deploy this repository as three separate Vercel projects from the same GitHub repo.

## 1. Backend API

Create a Vercel project with:

- Root Directory: `apps/backend`
- Framework Preset: Other
- Build Command: leave empty
- Output Directory: leave empty
- Install Command: `npm install`

Environment variables:

```bash
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
CLIENT_URL=https://your-frontend.vercel.app
ADMIN_URL=https://your-admin.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-admin.vercel.app
ADMIN_EMAIL=
ADMIN_PASSWORD=
NODE_ENV=production
```

Health check:

```text
https://your-backend.vercel.app/api/health
```

The backend root should also return a small API JSON response:

```text
https://your-backend.vercel.app/
```

## 2. Frontend

Create a Vercel project with:

- Root Directory: `apps/frontend`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Environment variables:

```bash
VITE_API_URL=https://your-backend.vercel.app/api
VITE_ADMIN_URL=https://your-admin.vercel.app/login
VITE_STRIPE_PK=
```

## 3. Admin Panel

Create a Vercel project with:

- Root Directory: `apps/admin`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Environment variables:

```bash
VITE_API_URL=https://your-backend.vercel.app/api
```

## Stripe Webhook

After the backend is deployed, add this endpoint in Stripe:

```text
https://your-backend.vercel.app/api/payments/webhook
```

Copy the Stripe webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Deploy Order

1. Deploy backend first.
2. Copy backend URL into frontend/admin `VITE_API_URL`.
3. Deploy admin.
4. Copy admin URL into frontend `VITE_ADMIN_URL`.
5. Deploy frontend.
6. Update backend `CLIENT_URL`, `ADMIN_URL`, and `ALLOWED_ORIGINS` with the final Vercel URLs.
7. Redeploy backend after updating CORS variables.

## If You See Vercel 404: NOT_FOUND

Check the Vercel project's Root Directory first:

- Backend project must use `apps/backend`
- Frontend project must use `apps/frontend`
- Admin project must use `apps/admin`

If the backend opens but `/api/health` does not, redeploy after confirming all backend environment variables are set.
