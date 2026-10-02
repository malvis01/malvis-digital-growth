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

      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password,
        options: {
          data: {
            phone: normalizedPhone,
            business_name: businessName.trim(),
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("Account could not be created. Please try again.");

      if (!data.session) {
        throw new Error(
          "Your account was created, but email confirmation is enabled. Turn off email confirmation in Supabase Auth settings because this platform uses phone + password without OTP."
        );
      }

      const { data: existingBusiness } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", data.user.id)
        .maybeSingle();

      if (!existingBusiness) {
        const slugBase = businessName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        const { error: businessError } = await supabase.from("businesses").insert({
          owner_id: data.user.id,
          name: businessName.trim(),
          slug: `${slugBase || "business"}-${data.user.id.slice(0, 8)}`,
          phone: normalizedPhone,
        });

        if (businessError) throw businessError;
      }

      setMessage(
        "Business account created successfully. You can now use your phone number and password to log in."
      );
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
