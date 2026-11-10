# EC2 Task Manager

A beginner-friendly full-stack deployment project:
- Frontend: React + Vite
- Backend: Node.js + Express
- Persistence: JSON file (`data/tasks.json`)
- Deployment: Docker Compose + Nginx reverse proxy

## 1. Run locally without Docker

Requirements: Node.js 20+.

### Backend
```powershell
cd backend
npm install
npm run dev
```
Backend listens on port 3000.

### Frontend
Open another terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally http://localhost:5173).

## 2. Run with Docker Compose

From the project root:
```powershell
docker compose up --build -d
```
Open http://localhost:8080.

Check containers:
```powershell
docker compose ps
```
View logs:
```powershell
docker compose logs -f
```
Stop:
```powershell
docker compose down
```

Tasks persist in the `task-data` Docker volume. Removing containers with `docker compose down` does not remove that volume. Do not use `docker compose down -v` unless you intentionally want to delete saved tasks.

## 3. EC2 deployment outline

1. Install Docker Engine and the Docker Compose plugin on the EC2 Ubuntu instance.
2. Copy/clone this project to EC2.
3. Run `docker compose up --build -d` from the project directory.
4. Allow inbound TCP port 8080 in the EC2 Security Group for your own IP while testing.
5. Browse to `http://EC2_PUBLIC_IP:8080`.

For production, use HTTPS and a domain/reverse proxy. This practice project intentionally uses HTTP and port 8080.

## 4. API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update title/status |
| DELETE | `/api/tasks/:id` | Delete task |

Example create request:
```json
{
  "title": "Deploy frontend and backend to EC2"
}
```

## Architecture

Browser -> Nginx frontend container -> Express backend container -> JSON file in Docker volume.

The backend is not published directly to the internet; only the frontend's Nginx port is exposed.
