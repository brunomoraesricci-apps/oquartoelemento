"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Awaiting authentication...");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("Authenticating secure terminal...");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setStatus(payload?.error || "ACCESS DENIED. Invalid credentials.");
        setLoading(false);
        return;
      }

      setStatus("ACCESS GRANTED. Redirecting to Content Studio...");
      router.push("/admin");
      router.refresh();
    } catch {
      setStatus("CONNECTION FAILURE. Authentication service unavailable.");
      setLoading(false);
    }
  }

  return (
    <main className="admin-shell login-shell">
      <section className="login-panel">
        <div className="kicker">QE ARCHIVE SYSTEM</div>
        <h1>Access Terminal</h1>
        <p className="login-copy">Área restrita. Credenciais administrativas necessárias para acessar o Content Studio.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
          </label>

          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
          </label>

          <div className="login-status">
            <span>Status:</span>
            <strong>{status}</strong>
          </div>

          <button type="submit" className="danger" disabled={loading}>
            {loading ? "AUTENTICANDO..." : "AUTENTICAR"}
          </button>
        </form>
      </section>
    </main>
  );
}
