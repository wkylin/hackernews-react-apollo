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

Set the GraphQL endpoint with:

```env
VITE_GRAPHQL_URL=http://localhost:4000
```

## Backend

Create `server/.env` from `server/.env.example`, then run:

```bash
pnpm prisma:generate
pnpm prisma:push
pnpm dev:server
```

The backend listens on `http://localhost:4000`.
