import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect("/admin/login");
 const {data:profile}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle(); if(profile?.role!=="admin") redirect("/dashboard");
 const queries=await Promise.all([
  s.from("profiles").select("id,phone,full_name,role,created_at").order("created_at",{ascending:false}).limit(50),
  s.from("businesses").select("id,name,category,status,created_at").order("created_at",{ascending:false}).limit(50),
  s.from("campaigns").select("id,name,status,budget_ngn,created_at").order("created_at",{ascending:false}).limit(50),
  s.from("advertisements").select("id,title,status,budget_ngn,created_at").order("created_at",{ascending:false}).limit(50),
  s.from("leads").select("id,name,status,created_at").order("created_at",{ascending:false}).limit(50),
  s.from("referrals").select("id,referral_code,status,created_at").order("created_at",{ascending:false}).limit(50)
 ]);
 const [users,businesses,campaigns,ads,leads,referrals]=queries;
 const cards=[["Users",users.data?.length||0],["Businesses",businesses.data?.length||0],["Campaigns",campaigns.data?.length||0],["Ads",ads.data?.length||0],["Leads",leads.data?.length||0],["Referrals",referrals.data?.length||0]];
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-7xl"><header className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-indigo-600">Malvis Digital Growth</p><h1 className="text-2xl font-bold">Admin control center</h1><p className="text-sm text-slate-500">Signed in as {user.email}</p></header><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([x,n])=><div key={String(x)} className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{x}</p><p className="mt-2 text-3xl font-bold">{n}</p></div>)}</div><section className="mt-6 rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Recent advertisements</h2><div className="mt-4 space-y-2">{(ads.data||[]).map(a=><div key={a.id} className="flex justify-between rounded-xl border p-3"><span>{a.title}</span><span className="text-sm">{a.status}</span></div>)}</div></section></div></main>;
}