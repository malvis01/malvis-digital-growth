import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";

export default async function Leads(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect("/login");
 const {data:b}=await s.from("businesses").select("id").eq("owner_id",user.id).limit(1).maybeSingle();
 const {data:leads}=b?await s.from("leads").select("id,name,phone,message,status,created_at").eq("business_id",b.id).order("created_at",{ascending:false}):{data:[]};
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Section title="Leads" description="Customer enquiries and follow-up status." href="/dashboard">{leads?.length?<div className="space-y-3">{leads.map(l=><div key={l.id} className="rounded-xl border p-4"><div className="flex justify-between gap-3"><strong>{l.name}</strong><span className="text-xs uppercase text-slate-500">{l.status}</span></div><p className="mt-2 text-sm text-slate-600">{l.message||"No message"}</p><p className="mt-2 text-xs text-slate-400">{l.phone||"No phone"}</p></div>)}</div>:<p className="text-sm text-slate-500">No leads yet.</p>}</Section></div></main>;
}