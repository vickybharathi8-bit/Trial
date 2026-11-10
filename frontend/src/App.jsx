import { useCallback, useEffect, useMemo, useState } from "react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiOnline, setApiOnline] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Could not load tasks.");
      setTasks(await response.json());
      setApiOnline(true);
      setError("");
    } catch {
      setApiOnline(false);
      setError("Can't reach the backend. Check that the API container is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  async function addTask(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: cleanTitle })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to add task.");
      setTasks(current => [data, ...current]);
      setTitle("");
      setError("");
    } catch (err) { setError(err.message); }
  }

  async function toggleTask(task) {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed })
      });
      if (!response.ok) throw new Error("Unable to update task.");
      const updated = await response.json();
      setTasks(current => current.map(item => item.id === updated.id ? updated : item));
    } catch (err) { setError(err.message); }
  }

  async function deleteTask(id) {
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to delete task.");
      setTasks(current => current.filter(item => item.id !== id));
    } catch (err) { setError(err.message); }
  }

  const visibleTasks = useMemo(() => tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  }), [tasks, filter]);

  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✓</span><span>Task<span className="brand-accent">Flow</span></span></div>
        <div className={`api-status ${apiOnline ? "online" : "offline"}`}>
          <span className="status-dot" /> API {apiOnline ? "Online" : "Offline"}
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1>Make progress.<br /><span>One task at a time.</span></h1>
        <p className="subhead">A simple place to organise what needs to get done.</p>
      </section>

      <section className="panel">
        <form className="add-form" onSubmit={addTask}>
          <input value={title} onChange={event => setTitle(event.target.value)}
            placeholder="What needs to be done?" maxLength={120} aria-label="New task" />
          <button type="submit" disabled={!title.trim()}>Add task <span>＋</span></button>
        </form>

        <div className="summary">
          <div><strong>{tasks.length}</strong><span>Total tasks</span></div>
          <div><strong>{tasks.length - completedCount}</strong><span>In progress</span></div>
          <div><strong>{completedCount}</strong><span>Completed</span></div>
        </div>

        <div className="list-heading">
          <h2>Your tasks</h2>
          <div className="filters" aria-label="Filter tasks">
            {["all", "active", "completed"].map(option =>
              <button key={option} className={filter === option ? "selected" : ""}
                onClick={() => setFilter(option)} type="button">{option}</button>
            )}
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {loading ? <p className="empty">Loading your tasks…</p> :
          visibleTasks.length === 0 ? (
            <div className="empty"><span className="empty-icon">✦</span>
              <strong>{tasks.length ? "Nothing in this view" : "Your list is clear"}</strong>
              <span>Add a task above to get started.</span>
            </div>
          ) : (
            <ul className="task-list">
              {visibleTasks.map(task => (
                <li key={task.id} className={task.completed ? "task completed" : "task"}>
                  <button className="check" type="button" onClick={() => toggleTask(task)}
                    aria-label={task.completed ? "Mark as active" : "Mark as completed"}>
                    {task.completed ? "✓" : ""}
                  </button>
                  <span className="task-title">{task.title}</span>
                  <span className="task-date">{new Date(task.createdAt).toLocaleDateString()}</span>
                  <button className="delete" type="button" onClick={() => deleteTask(task.id)} aria-label="Delete task">×</button>
                </li>
              ))}
            </ul>
          )
        }
      </section>
      <footer>TaskFlow <span>·</span> Full-stack deployment practice</footer>
    </main>
  );
}
