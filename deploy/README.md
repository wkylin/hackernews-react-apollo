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

Run the backend on the same ECS instance or an internal host, for example:

```bash
HOST=127.0.0.1 PORT=4000 pnpm --dir server start
```

Then configure `api.wkylin.cn` to proxy to `http://127.0.0.1:4000/`.
Example Nginx config: `deploy/nginx/api.conf`.

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
