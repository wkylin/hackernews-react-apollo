# HackerNews React Apollo

Full-stack Hacker News clone split into separate frontend and backend packages.

## Structure

```text
frontend/  React 19 + Vite + Apollo Client
server/    GraphQL Yoga + Prisma ORM + MySQL
```

## Install

```bash
pnpm install
```

## Frontend

```bash
pnpm dev:frontend
pnpm build:frontend
pnpm preview:frontend
```

Vite loads the GraphQL endpoint from mode-specific env files:

- local dev: `frontend/.env.development` -> `http://localhost:4000`
- production build: `frontend/.env.production` -> `https://api.wkylin.cn`

The production frontend domain is `https://hacker.wkylin.cn`.

## Backend

Create `server/.env` from `server/.env.example`, then run:

```bash
pnpm prisma:generate
pnpm prisma:push
pnpm dev:server
```

The backend listens on `http://localhost:4000` locally and is intended to run behind `https://api.wkylin.cn` in production.

Deployment examples are in `deploy/`.
