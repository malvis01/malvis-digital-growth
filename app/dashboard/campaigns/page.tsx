import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";

export default async function Campaigns(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect("/login");
 const {data:b}=await s.from("businesses").select("id").eq("owner_id",user.id).limit(1).maybeSingle();
 const {data:rows}=b?await s.from("campaigns").select("id,name,objective,budget_ngn,status").eq("business_id",b.id).order("created_at",{ascending:false}):{data:[]};
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Section title="Campaigns" description="Plan, budget and monitor marketing campaigns." href="/dashboard">{rows?.length?<div className="grid gap-3 sm:grid-cols-2">{rows.map(x=><div key={x.id} className="rounded-xl border p-4"><div className="flex justify-between"><strong>{x.name}</strong><span className="text-xs uppercase">{x.status}</span></div><p className="mt-2 text-sm text-slate-500">{x.objective||"No objective"}</p><p className="mt-3 font-semibold">NGN {Number(x.budget_ngn||0).toLocaleString()}</p></div>)}</div>:<p className="text-sm text-slate-500">No campaigns yet.</p>}</Section></div></main>;
}