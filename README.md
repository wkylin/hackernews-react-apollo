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

## Production Deployment

Build the backend release package locally or in CI:

```bash
pnpm --dir server build
```

This creates `server/release/`, a minimal production package containing `dist/`, `package.json`, `.env.example`, `ecosystem.config.cjs`, and release notes. Upload the contents of `server/release/` to the server, for example:

```text
/var/www/hackernews/server
```

Do not upload a real `.env` from your local machine. Keep the production `.env` on the server and update it manually when configuration changes.

On the server, install production dependencies and start the API:

```bash
cd /var/www/hackernews/server
cp .env.example .env
# Edit .env and set the real DATABASE_URL, APP_SECRET, and FRONTEND_ORIGINS.
pnpm install --prod
pm2 start ecosystem.config.cjs
pm2 save
```

For later deployments, upload the new release files, then run:

```bash
cd /var/www/hackernews/server
pnpm install --prod
pm2 reload hackernews-api
```

`pnpm install --prod` is still required because the build bundles this project's TypeScript source into `dist/index.js`, but third-party runtime packages such as `dotenv`, `graphql-yoga`, Prisma, and database adapters remain external and are loaded from `node_modules`.

Verify the deployment:

```bash
curl -i http://127.0.0.1:4000/health
curl -i https://api.wkylin.cn/health
```

Deployment examples are in `deploy/`.
