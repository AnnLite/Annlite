import { useState } from "react";

type Session = {
  token: string;
  user: {
    email: string;
    role: string;
  };
};

const stats = [
  { label: "Active campaigns", value: "03" },
  { label: "Verified donors", value: "1,286" },
  { label: "Need review", value: "07" },
  { label: "System status", value: "Healthy" },
];

export default function App() {
  const [email, setEmail] = useState("ops@annlite.org");
  const [password, setPassword] = useState("annlite-admin-dev");
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:4000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { token?: string; error?: string; user?: Session["user"] };

      if (!response.ok || !data.token || !data.user) {
        throw new Error(data.error ?? "Authentication failed");
      }

      const nextSession = {
        token: data.token,
        user: data.user,
      };

      setSession(nextSession);
      localStorage.setItem("annlite.admin.session", JSON.stringify(nextSession));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  const summary = session ? (
    <div style={{ marginTop: 28, border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
      <h2>Authenticated admin session</h2>
      <p>
        Logged in as <strong>{session.user.email}</strong> with role <strong>{session.user.role}</strong>.
      </p>
      <p>RBAC checks are enforced by the backend before access to restricted admin endpoints.</p>
    </div>
  ) : null;

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 32, maxWidth: 960, margin: "0 auto" }}>
      <h1>AnnLite Admin</h1>
      <p>Operations overview and governance dashboard with role-based access control.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 420, marginTop: 24 }}>
        <label>
          <div>Email</div>
          <input value={email} onChange={(event) => setEmail(event.target.value)} style={{ width: "100%", padding: 10, marginTop: 4 }} />
        </label>
        <label>
          <div>Password</div>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ padding: "12px 16px", cursor: "pointer" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}
      </form>

      {summary}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 24 }}>
        {stats.map((stat) => (
          <article key={stat.label} style={{ border: "1px solid #d1d5db", borderRadius: 12, padding: 20, background: "#f9fafb" }}>
            <div style={{ color: "#6b7280", fontSize: 14 }}>{stat.label}</div>
            <strong style={{ fontSize: 28, display: "block", marginTop: 8 }}>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section style={{ marginTop: 28, border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <h2>Operational guardrails</h2>
        <ul>
          <li>Provider integration remains external and explicit.</li>
          <li>Webhook verification and secure logging are required before live processing.</li>
          <li>Admin access is limited to verified governance roles.</li>
        </ul>
      </section>
    </main>
  );
}
