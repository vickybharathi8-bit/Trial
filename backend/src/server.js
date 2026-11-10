import express from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT || 3004);
const HOST = process.env.HOST || "0.0.0.0";

app.use(express.json());

// Same-origin deployment through Nginx does not require CORS.
// CORS is enabled for local development / direct API testing.
app.use(cors());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "api-connection-practice",
    message: "API connection successful",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/status", (_req, res) => {
  res.json({
    ok: true,
    service: "API Connection Practice",
    runtime: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/notifications", (_req, res) => {
  res.json({
    ok: true,
    notifications: [
      { id: 1, title: "API is available", detail: "The backend health check is responding.", type: "success" },
      { id: 2, title: "Reverse proxy practice", detail: "Nginx can forward /api requests to this service.", type: "info" },
      { id: 3, title: "PM2 process management", detail: "Use PM2 to keep the backend running.", type: "info" }
    ]
  });
});

app.post("/api/echo", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Your frontend successfully sent data to the backend.",
    received: req.body ?? {},
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: `API route not found: ${req.method} ${req.path}`
  });
});

app.listen(PORT, HOST, () => {
  console.log(`API practice backend listening on http://${HOST}:${PORT}`);
});
