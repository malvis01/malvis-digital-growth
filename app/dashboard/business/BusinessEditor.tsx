"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BusinessEditor({ business }: { business: any }) {
  const [form, setForm] = useState({
    name: business?.name ?? "",
    description: business?.description ?? "",
    category: business?.category ?? "",
    phone: business?.phone ?? "",
    whatsapp: business?.whatsapp ?? "",
    email: business?.email ?? "",
    address: business?.address ?? "",
    city: business?.city ?? "",
    state: business?.state ?? "Bayelsa",
    website_url: business?.website_url ?? "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const s = createClient();
      const { data, error } = await s
        .from("businesses")
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq("id", business.id)
        .eq("owner_id", (await s.auth.getUser()).data.user?.id)
        .select("id")
        .maybeSingle();

      if (error) {
        setMessage("Profile could not be saved: " + error.message);
      } else if (!data) {
        setMessage("No profile was updated. Please sign in again and retry; if this continues, contact support.");
      } else {
        setMessage("Business profile updated successfully.");
      }
    } catch {
      setMessage("Something went wrong while saving. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
      {Object.entries(form).map(([key, value]) => (
        <label key={key} className={`text-sm font-medium capitalize ${key === "description" ? "sm:col-span-2" : ""}`}>
          {key.replaceAll("_", " ")}
          {key === "description" ? (
            <textarea
              className="mt-1 min-h-32 w-full rounded-xl border p-3 font-normal"
              value={value}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder="Describe your business, products, or services"
              maxLength={2000}
            />
          ) : (
            <input
              className="mt-1 w-full rounded-xl border p-3 font-normal"
              type={key === "email" ? "email" : key === "website_url" ? "url" : "text"}
              value={value}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={key === "website_url" ? "https://example.com" : key === "whatsapp" ? "+234..." : ""}
            />
          )}
        </label>
      ))}
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button disabled={loading} className="rounded-xl bg-black px-5 py-3 text-sm text-white disabled:opacity-50">
          {loading ? "Saving..." : "Save profile"}
        </button>
        {message && <span role="status" className="text-sm text-slate-600">{message}</span>}
      </div>
    </form>
  );
}
