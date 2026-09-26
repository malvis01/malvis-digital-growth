"use client";

import { useState } from "react";

export default function WithdrawalForm({ balance }: { balance: number }) {
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");

    const response = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        bankName: bank,
        accountName: name,
        accountNumber: number,
      }),
    });

    const result = await response.json();
    setMsg(result.error || "Withdrawal request submitted.");

    if (!result.error) {
      setAmount("");
      setBank("");
      setName("");
      setNumber("");
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border bg-white p-5">
      <h2 className="font-semibold">Request withdrawal</h2>
      <p className="mt-1 text-sm text-slate-500">
        Available commission balance: ₦{balance.toLocaleString()}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          required
          type="number"
          min="1"
          max={balance}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (₦)"
          className="rounded-xl border p-3"
        />
        <input
          required
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          placeholder="Bank name"
          className="rounded-xl border p-3"
        />
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Account name"
          className="rounded-xl border p-3"
        />
        <input
          required
          inputMode="numeric"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Account number"
          className="rounded-xl border p-3"
        />
      </div>

      <button
        type="submit"
        className="mt-4 rounded-xl bg-black px-4 py-2 text-sm text-white"
      >
        Submit withdrawal
      </button>

      {msg && <p className="mt-3 text-sm text-slate-600">{msg}</p>}
    </form>
  );
}
