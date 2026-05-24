# HackerNews API Release

Upload this directory to the server.

First deployment:

```bash
cp .env.example .env
pnpm install --prod
pm2 start ecosystem.config.cjs
pm2 save
```

Later deployments:

```bash
pnpm install --prod
pm2 reload hackernews-api
```

Keep the real .env on the server and do not overwrite it unless configuration changes.
