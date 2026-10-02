"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeNigeriaPhone } from "@/lib/phone";
import { phoneToAuthEmail } from "@/lib/phoneAuth";
import PasswordRequirements from "./PasswordRequirements";

type Mode = "login" | "register";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const normalizedPhone = normalizeNigeriaPhone(phone);
      const authEmail = phoneToAuthEmail(normalizedPhone);

      if (
        password.length < 8 ||
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/\d/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
      ) {
        throw new Error(
          "Password must be at least 8 characters and include uppercase, lowercase, number and symbol."
        );
      }

      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });

        if (error) throw error;

        router.push("/dashboard");
        router.refresh();
        return;
      }

      if (!businessName.trim()) {
        throw new Error("Enter your business name.");
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone,
          password,
          businessName: businessName.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Account could not be created. Please try again.");
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (loginError) throw loginError;

      setMessage("Business account created successfully. Welcome to Malvis Digital Growth!");
      setPhone("");
      setPassword("");
      setBusinessName("");
      router.push("/dashboard");
      router.refresh();
      setPhone("");
      setPassword("");
      setBusinessName("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      {mode === "register" && (
        <input
          className="w-full rounded-xl border p-3"
          type="text"
          placeholder="Business name"
          value={businessName}
          onChange={(event) => setBusinessName(event.target.value)}
          autoComplete="organization"
          required
        />
      )}

      <input
        className="w-full rounded-xl border p-3"
        type="tel"
        placeholder="+2348012345678"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        autoComplete="tel"
        required
      />

      <input
        className="w-full rounded-xl border p-3"
        type="password"
        placeholder="Password (8+ characters)"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        required
      />

      {mode === "register" && <PasswordRequirements password={password} />}

      {message && (
        <p className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
          {message}
        </p>
      )}

      <button
        className="w-full rounded-xl bg-black p-3 text-white disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
      </button>
    </form>
  );
}
