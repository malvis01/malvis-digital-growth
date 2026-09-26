import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";

export default async function BusinessPage() {
  const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect("/login");
  const {data:business}=await s.from("businesses").select("*").eq("owner_id",user.id).limit(1).maybeSingle();
  const fields=["name","category","phone","whatsapp","email","address","city","state","website_url"];
  return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Section title="Business profile" description="Keep the information customers see accurate." href="/dashboard"><div className="grid gap-4 sm:grid-cols-2">{fields.map(key=><div key={key} className="rounded-xl border p-4"><p className="text-xs uppercase text-slate-400">{key.replaceAll("_"," ")}</p><p className="mt-1 font-medium">{business?.[key] ?? "Not set"}</p></div>)}</div><p className="mt-5 text-sm text-slate-500">Your profile is protected by Supabase row-level security.</p></Section></div></main>;
}