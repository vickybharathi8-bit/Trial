import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_FILE = process.env.DATA_FILE || path.join(process.cwd(), "data", "tasks.json");

app.use(cors());
app.use(express.json());

async function readTasks() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeTasks(tasks) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const tempFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(tasks, null, 2), "utf8");
  await fs.rename(tempFile, DATA_FILE);
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "online", service: "task-manager-api", timestamp: new Date().toISOString() });
});

app.get("/api/tasks", async (_req, res, next) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (error) { next(error); }
});

app.post("/api/tasks", async (req, res, next) => {
  try {
    const title = String(req.body?.title || "").trim();
    if (!title) return res.status(400).json({ error: "Task title is required." });
    if (title.length > 120) return res.status(400).json({ error: "Task title must be 120 characters or fewer." });
    const tasks = await readTasks();
    const task = { id: randomUUID(), title, completed: false, createdAt: new Date().toISOString() };
    tasks.unshift(task);
    await writeTasks(tasks);
    res.status(201).json(task);
  } catch (error) { next(error); }
});

app.patch("/api/tasks/:id", async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const index = tasks.findIndex(task => task.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Task not found." });

    const updated = { ...tasks[index] };
    if (Object.hasOwn(req.body || {}, "title")) {
      const title = String(req.body.title || "").trim();
      if (!title || title.length > 120) return res.status(400).json({ error: "Title must contain 1–120 characters." });
      updated.title = title;
    }
    if (Object.hasOwn(req.body || {}, "completed")) {
      if (typeof req.body.completed !== "boolean") return res.status(400).json({ error: "completed must be true or false." });
      updated.completed = req.body.completed;
    }
    tasks[index] = updated;
    await writeTasks(tasks);
    res.json(updated);
  } catch (error) { next(error); }
});

app.delete("/api/tasks/:id", async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const remaining = tasks.filter(task => task.id !== req.params.id);
    if (remaining.length === tasks.length) return res.status(404).json({ error: "Task not found." });
    await writeTasks(remaining);
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, "0.0.0.0", () => console.log(`Task Manager API listening on ${PORT}`));
