# Deployment Notes

## Frontend

Build output is `frontend/dist`. Deploy that directory to the server path used by Nginx:

```bash
pnpm build:frontend
```

Example Nginx config: `deploy/nginx/frontend.conf`.

The important rule is:

```nginx
try_files $uri $uri/ /index.html;
```

Without it, refreshing `/new/1`, `/login`, `/submit`, or `/user?id=...` returns 404 because those routes are handled by React Router in the browser.

## API

The production frontend build uses:

```env
VITE_GRAPHQL_URL=https://api.wkylin.cn
```

Build the backend bundle and run it with PM2:

```bash
pnpm --dir server build
```

Upload this minimal server set:

```text
server/release/
```

`server/release/` is created by `pnpm --dir server build` and contains `dist/`, `package.json`, `.env.example`, and `ecosystem.config.cjs`.

Do not package the real `.env` into release artifacts. Keep it on the server and update it manually when configuration changes.

Install production dependencies on the server:

```bash
pnpm install --prod
```

Start with PM2:

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

Then configure `api.wkylin.cn` to proxy to `http://127.0.0.1:4000/` or run the bundle on that port.
Example Nginx config: `deploy/nginx/api.conf`.

If `api.wkylin.cn` returns 502, check in this order on the server:

```bash
pm2 status
pm2 logs hackernews-api --lines 100
curl -i http://127.0.0.1:4000/health
curl -i http://api.wkylin.cn/health
nginx -t
systemctl reload nginx
```

Interpretation:

- `curl 127.0.0.1:4000/health` fails: PM2 app is not running, crashed, or listening on a different host/port.
- local health passes but `api.wkylin.cn/health` fails: Nginx `proxy_pass`, DNS, security group, or server block is wrong.
- health passes but GraphQL fails: inspect backend logs and database connectivity.

The backend also needs:

```env
FRONTEND_ORIGINS="https://hacker.wkylin.cn,http://localhost:3000,http://localhost:5173"
```

## DNS and Security Group

Create DNS A records:

- `hacker.wkylin.cn` -> frontend ECS public IP
- `api.wkylin.cn` -> backend/API ECS public IP

Open these ports in the Alibaba Cloud security group:

- `80`
- `443` if HTTPS is enabled
- Do not expose `4000` publicly if Nginx proxies to `127.0.0.1:4000`.

## HTTPS

If the frontend is served on `https://hacker.wkylin.cn`, the API should also use HTTPS. Otherwise browsers may block mixed content or fail preflight requests.
