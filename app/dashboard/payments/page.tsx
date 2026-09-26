import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";

export default async function PaymentsPage(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user)redirect("/login");
 const {data:b}=await s.from("businesses").select("id").eq("owner_id",user.id).limit(1).maybeSingle();
 const {data:rows}=b?await s.from("payments").select("id,amount_ngn,provider,provider_reference,status,paid_at,created_at").eq("business_id",b.id).order("created_at",{ascending:false}):{data:[]};
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Section title="Payments" description="Review payment records." href="/dashboard">{rows?.length?rows.map(p=><div key={p.id} className="mb-3 rounded-xl border bg-white p-4 flex justify-between"><div><strong>₦{Number(p.amount_ngn).toLocaleString()}</strong><p className="text-xs text-slate-500">{p.provider||"Provider pending"}</p></div><span>{p.status}</span></div>):<p className="text-sm text-slate-500">No payments recorded yet.</p>}</Section></div></main>;
}