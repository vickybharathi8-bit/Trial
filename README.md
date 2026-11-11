# API Connection Practice

A responsive React + Vite frontend and Node.js + Express backend for practising:
- frontend-to-backend API communication
- Nginx reverse proxy
- PM2 process management
- EC2 deployment

## Architecture

Browser -> Nginx (port 80/443) -> Node/Express (127.0.0.1:3004)

The frontend calls relative URLs such as `/api/health`. It does not need to know the backend port.
For local development, Vite proxies `/api` to the backend.

## Project structure

- `frontend/` - React application
- `backend/` - Express API
- `deployment/nginx-api-proxy.conf` - Nginx location example
- `deployment/ecosystem.config.cjs` - PM2 configuration

## 1. Run backend locally or on EC2

```bash
cd backend
npm install
npm start
```

Default port is 3004. Test:

```bash
curl http://127.0.0.1:3004/api/health
curl http://127.0.0.1:3004/api/status
```

For local testing, the server binds to `0.0.0.0`. For EC2 behind Nginx, set `HOST=127.0.0.1`.

## 2. Run frontend locally

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally http://localhost:5173).
Vite forwards `/api` requests to `http://127.0.0.1:3004` using `frontend/vite.config.js`.

## 3. Build frontend

```bash
cd frontend
npm run build
```

Upload the contents of `frontend/dist/` to the frontend document root on EC2.

The frontend uses `/api/...` relative URLs. When the deployed frontend and Nginx reverse proxy share the same origin, changing the backend port does not require a frontend rebuild.

## 4. Run backend with PM2 on EC2

From the backend directory:

```bash
npm install
sudo npm install -g pm2
HOST=127.0.0.1 PORT=3004 pm2 start src/server.js --name api-practice-backend
pm2 status
pm2 logs api-practice-backend
pm2 startup
```

Execute the exact command PM2 prints, then run:

```bash
pm2 save
```

To deploy backend code updates:

```bash
npm install
pm2 restart api-practice-backend --update-env
```

The optional `deployment/ecosystem.config.cjs` is a PM2 configuration example. If you use it, update its `cwd` to the actual backend directory on your EC2 instance before starting it.

## 5. Nginx reverse proxy

Add the contents of `deployment/nginx-api-proxy.conf` inside the existing `server { ... }` block that serves your frontend.

Then:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Test through Nginx:

```bash
curl http://127.0.0.1/api/health
```

The Nginx `proxy_pass` target must match the backend port and bind address. Keep port 3004 private; do not add it to the EC2 Security Group when Nginx is the public entry point.

## API endpoints

- `GET /api/health` - health check
- `GET /api/status` - backend runtime details
- `GET /api/notifications` - example notifications
- `POST /api/echo` - returns the JSON body sent by the frontend

## Important

- The browser must use `/api/...`, not `http://localhost:3004/...`.
- `localhost` in browser JavaScript means the visitor's own computer.
- The API connection badge and toast are driven by actual health-check requests.
- The app checks the API on page load and every 10 seconds.

#Jenkins

-Automated the CI/CD pipeline
