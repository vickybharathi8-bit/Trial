import { useCallback, useEffect, useState } from "react";
import { Activity, ArrowUpRight, Bell, CheckCircle2, CircleAlert, Clock3, RefreshCw, Send, Server, Wifi, WifiOff } from "lucide-react";

const API = ""; // Same-origin API. Nginx routes /api to the backend.

export default function App() {
  const [connection, setConnection] = useState("checking");
  const [health, setHealth] = useState(null);
  const [status, setStatus] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [lastChecked, setLastChecked] = useState(null);
  const [toast, setToast] = useState(null);
  const [message, setMessage] = useState("Hello from the frontend");
  const [echoResult, setEchoResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const showToast = (kind, text) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 3500);
  };

  const checkConnection = useCallback(async (quiet = false) => {
    try {
      const response = await fetch(`${API}/api/health`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const wasConnected = connection === "connected";
      setHealth(data);
      setConnection("connected");
      setLastChecked(new Date());
      if (!quiet && !wasConnected) showToast("success", "Backend API connection established.");
      return true;
    } catch (error) {
      const wasConnected = connection === "connected";
      setConnection("disconnected");
      setHealth(null);
      setLastChecked(new Date());
      if (!quiet || wasConnected) showToast("error", `Backend API unavailable: ${error.message}`);
      return false;
    }
  }, [connection]);

  const loadDashboard = useCallback(async () => {
    const connected = await checkConnection(true);
    if (!connected) return;
    try {
      const [statusResponse, notificationResponse] = await Promise.all([
        fetch(`${API}/api/status`, { cache: "no-store" }),
        fetch(`${API}/api/notifications`, { cache: "no-store" })
      ]);
      if (!statusResponse.ok || !notificationResponse.ok) throw new Error("Could not load API details");
      const statusData = await statusResponse.json();
      const notificationData = await notificationResponse.json();
      setStatus(statusData);
      setNotifications(notificationData.notifications || []);
    } catch (error) {
      showToast("error", error.message);
    }
  }, [checkConnection]);

  useEffect(() => {
    loadDashboard();
    const timer = window.setInterval(() => checkConnection(true), 10000);
    return () => window.clearInterval(timer);
  }, [loadDashboard, checkConnection]);

  async function sendTestRequest(event) {
    event.preventDefault();
    setBusy(true);
    setEchoResult(null);
    try {
      const response = await fetch(`${API}/api/echo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, source: "Pulse API Console" })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
      setEchoResult(data);
      showToast("success", "POST request completed successfully.");
    } catch (error) {
      showToast("error", `Request failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  const connected = connection === "connected";

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark"><Activity size={19} /></span><span>pulse<span className="brand-light">.console</span></span></a>
        <div className="top-actions">
          <span className={`connection-pill ${connected ? "online" : connection === "checking" ? "checking" : "offline"}`}>
            <span className="status-dot" />{connection === "checking" ? "Checking API" : connected ? "API Connected" : "API Disconnected"}
          </span>
          <button className="icon-button" onClick={() => loadDashboard()} aria-label="Refresh API status"><RefreshCw size={17} /></button>
        </div>
      </header>

      <div style={{
  padding: "12px",
  margin: "15px 0",
  background: "#164e63",
  color: "white",
  borderRadius: "8px",
  textAlign: "center"
}}>
  Feature Branch: Conflict Practice by Vicky
</div>

            <div style={{
        margin: "18px 0",
        padding: "14px 18px",
        border: "1px solid #16a34a",
        borderRadius: "10px",
        background: "rgba(22, 163, 74, 0.10)",
        color: "#22c55e",
        fontSize: "14px",
        fontWeight: 600
      }}>
        ✓ Latest deployment: Delivered automatically through Jenkins CI/CD by vicky
      </div>

      <section className="hero"></section>
      <section className="hero">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> EC2 DEPLOYMENT PRACTICE</div>
          <h1>Your API, <span>in sight.</span></h1>
          <p className="hero-copy">A simple control room to verify frontend-to-backend connectivity, inspect API health, and test requests.</p>
        </div>
        <div className={`hero-status ${connected ? "hero-online" : "hero-offline"}`}>
          {connected ? <Wifi size={23} /> : <WifiOff size={23} />}
          <div><strong>{connected ? "Connection healthy" : connection === "checking" ? "Connecting..." : "Connection lost"}</strong><small>{connected ? "Backend is responding" : "Waiting for API response"}</small></div>
        </div>
      </section>

      <section className="metrics">
        <article className="metric-card">
          <div className="metric-head"><span>API STATUS</span><Activity size={17} /></div>
          <div className="metric-value">{connected ? "Online" : connection === "checking" ? "Checking" : "Offline"}</div>
          <div className="metric-foot"><span className={`mini-dot ${connected ? "green" : "red"}`} /> Live health check</div>
        </article>
        <article className="metric-card">
          <div className="metric-head"><span>BACKEND SERVICE</span><Server size={17} /></div>
          <div className="metric-value">{status?.service || "—"}</div>
          <div className="metric-foot">Node.js {status?.runtime || "version pending"}</div>
        </article>
        <article className="metric-card">
          <div className="metric-head"><span>UPTIME</span><Clock3 size={17} /></div>
          <div className="metric-value">{status ? `${Math.floor(status.uptimeSeconds / 60)}m` : "—"}</div>
          <div className="metric-foot">Since backend process start</div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading"><div><div className="section-kicker">CONNECTION MONITOR</div><h2>API health</h2></div><button className="text-button" onClick={() => loadDashboard()}><RefreshCw size={14} /> Refresh</button></div>
          <div className="health-row">
            <div className={`health-icon ${connected ? "healthy" : "unhealthy"}`}>{connected ? <CheckCircle2 size={22} /> : <CircleAlert size={22} />}</div>
            <div className="health-text"><strong>{health?.message || (connected ? "API responded successfully" : "No successful health response yet")}</strong><span>{lastChecked ? `Last checked ${lastChecked.toLocaleTimeString()}` : "Waiting for first check"}</span></div>
            <span className={`tiny-tag ${connected ? "tag-green" : "tag-red"}`}>{connected ? "200 OK" : "NO RESPONSE"}</span>
          </div>
          <div className="endpoint-box"><span className="method">GET</span><code>/api/health</code><span className="endpoint-note">Health endpoint</span></div>
          <div className="endpoint-box"><span className="method">GET</span><code>/api/status</code><span className="endpoint-note">Runtime details</span></div>
          <div className="endpoint-box"><span className="method">GET</span><code>/api/notifications</code><span className="endpoint-note">Sample data</span></div>
          <p className="muted-note">Automatic health check runs every 10 seconds while this page is open.</p>
        </article>

        <article className="panel test-panel">
          <div className="panel-heading"><div><div className="section-kicker">REQUEST PLAYGROUND</div><h2>Send a test request</h2></div><span className="post-tag">POST</span></div>
          <p className="panel-description">Send a message from the frontend to the Express backend and inspect the response.</p>
          <form onSubmit={sendTestRequest}>
            <label htmlFor="message">Request payload</label>
            <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows="3" />
            <button className="primary-button" type="submit" disabled={busy || !connected}>{busy ? "Sending..." : "Send API request"} <Send size={15} /></button>
          </form>
          {echoResult && <div className="response-box"><div className="response-title"><CheckCircle2 size={15} /> API RESPONSE</div><pre>{JSON.stringify(echoResult, null, 2)}</pre></div>}
        </article>
      </section>

      <section className="panel activity-panel">
        <div className="panel-heading"><div><div className="section-kicker">BACKEND RESPONSE</div><h2>Notifications & events</h2></div><span className="count-badge"><Bell size={13} /> {notifications.length} items</span></div>
        {notifications.length ? <div className="notification-list">{notifications.map(item => <div className="notification" key={item.id}><span className={`notification-icon ${item.type}`}><Bell size={16} /></span><div><strong>{item.title}</strong><p>{item.detail}</p></div><ArrowUpRight className="event-arrow" size={16} /></div>)}</div> : <div className="empty-state">{connected ? "No notifications returned by the API." : "Notifications will appear when the backend reconnects."}</div>}
      </section>

      <footer><span> PULSE.CONSOLE <i /> API CONNECTION LAB</span><span>Built for deployment practice</span></footer>

      {toast && <div className={`toast ${toast.kind}`} role="status"><span>{toast.kind === "success" ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}</span>{toast.text}<button onClick={() => setToast(null)} aria-label="Dismiss notification">×</button></div>}
    </main>
  );
}
