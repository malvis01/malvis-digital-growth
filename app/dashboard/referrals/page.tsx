import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";

export default async function Referrals(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect("/login");
 const {data:rows}=await s.from("referrals").select("id,referral_code,status,created_at").eq("referrer_id",user.id).order("created_at",{ascending:false});
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Section title="Referrals & commissions" description="Track referral codes and progress." href="/dashboard">{rows?.length?<div className="space-y-3">{rows.map(x=><div key={x.id} className="flex justify-between rounded-xl border p-4"><span className="font-medium">{x.referral_code}</span><span className="text-sm uppercase text-slate-500">{x.status}</span></div>)}</div>:<p className="text-sm text-slate-500">No referrals yet.</p>}</Section></div></main>;
}