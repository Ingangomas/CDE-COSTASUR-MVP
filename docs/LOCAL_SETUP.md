# Local setup — Costasur CDE MVP

## Requirements

Node.js 20 or newer and npm are required. The application uses the existing React/Vite/Tailwind stack and the Supabase project configured for Costasur.

## Environment

Create `.env.local` from `.env.example` and set `VITE_SUPABASE_URL` plus `VITE_SUPABASE_ANON_KEY`. Do not add `SUPABASE_SERVICE_ROLE_KEY`, database passwords, or other secrets to the frontend environment.

## Commands

```bash
npm install
npm run lint
npm run dev
npm run build
```

## Demonstration project

Use the persistent project `CDE-DEMO-001` / `Villa Demo Costasur — Expediente Integral`. The demo accounts and password are documented in the technical handoff and must be rotated before any external presentation.
