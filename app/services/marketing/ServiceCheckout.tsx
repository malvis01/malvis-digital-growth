"use client";

import { useState } from "react";

export default function ServiceCheckout({ service, label }: { service: string; label: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function checkout() {
    setBusy(true);
    setMessage("");
    const r = await fetch("/api/marketing-services/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service, billingEmail: email.trim() }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setMessage(data.error || "Unable to start payment.");
      setBusy(false);
      return;
    }
    if (data.authorization_url) {
      window.location.href = data.authorization_url;
      return;
    }
    setMessage("Unable to start payment.");
    setBusy(false);
  }

  return (
    <div className="mt-7">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Billing email (optional)"
        className="mb-3 w-full rounded-xl border p-3 text-sm"
      />
      <button
        type="button"
        onClick={checkout}
        disabled={busy}
        className="block w-full rounded-xl bg-slate-950 px-4 py-3 text-center font-bold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {busy ? "Opening secure checkout..." : label}
      </button>
      {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
    </div>
  );
}
