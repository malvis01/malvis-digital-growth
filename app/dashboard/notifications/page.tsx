import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";

export default async function Notifications(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect("/login");
 const {data:rows}=await s.from("notifications").select("id,title,message,type,read_at,created_at").eq("user_id",user.id).order("created_at",{ascending:false});
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Section title="Notifications" description="Account and marketing activity alerts." href="/dashboard">{rows?.length?<div className="space-y-3">{rows.map(x=><div key={x.id} className="rounded-xl border p-4"><div className="flex justify-between"><strong>{x.title}</strong><span className="text-xs uppercase text-slate-400">{x.type}</span></div><p className="mt-1 text-sm text-slate-600">{x.message}</p></div>)}</div>:<p className="text-sm text-slate-500">You are all caught up.</p>}</Section></div></main>;
}