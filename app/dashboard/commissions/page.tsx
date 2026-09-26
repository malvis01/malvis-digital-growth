import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";
import WithdrawalForm from "./WithdrawalForm";

export default async function CommissionsPage(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user)redirect("/login");
 const {data:rows}=await s.from("commissions").select("id,amount_ngn,status,created_at").eq("profile_id",user.id).order("created_at",{ascending:false});
 const balance=(rows||[]).filter(r=>r.status==="paid").reduce((a,r)=>a+Number(r.amount_ngn),0);
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Section title="Commissions" description="Track referral commissions." href="/dashboard">{rows?.length?rows.map(r=><div key={r.id} className="mb-3 rounded-xl border bg-white p-4 flex justify-between"><strong>₦{Number(r.amount_ngn).toLocaleString()}</strong><span>{r.status}</span></div>):<p className="text-sm text-slate-500">No commissions yet.</p>}<WithdrawalForm balance={balance}/></Section></div></main>;
}