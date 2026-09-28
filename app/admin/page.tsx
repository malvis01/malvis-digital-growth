import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminManager from "./AdminManager";
import PlatformRevenue from "./PlatformRevenue";
import MediaManager from "./MediaManager";

export default async function AdminPage(){
 const s=await createClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user) redirect("/admin/login");
 const {data:profile}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(profile?.role!=="admin") redirect("/dashboard");
 const [users,businesses,campaigns,ads,leads,referrals,media]=await Promise.all([
  s.from("profiles").select("id,phone,full_name,role,created_at").order("created_at",{ascending:false}).limit(100),
  s.from("businesses").select("id,name,category,status,city,created_at").order("created_at",{ascending:false}).limit(100),
  s.from("campaigns").select("id,name,status,budget_ngn,objective,created_at").order("created_at",{ascending:false}).limit(100),
  s.from("advertisements").select("id,title,status,budget_ngn,placement,created_at").order("created_at",{ascending:false}).limit(100),
  s.from("leads").select("id,name,status,phone,email,created_at").order("created_at",{ascending:false}).limit(100),
  s.from("referrals").select("id,referral_code,status,created_at").order("created_at",{ascending:false}).limit(100),
  s.from("media_items").select("id,title,media_kind,status,created_at").order("created_at",{ascending:false}).limit(100)
 ]);
 const cards=[["Users",users.data?.length||0],["Businesses",businesses.data?.length||0],["Campaigns",campaigns.data?.length||0],["Ads",ads.data?.length||0],["Leads",leads.data?.length||0],["Referrals",referrals.data?.length||0]];
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-7xl"><header className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-indigo-600">Malvis Digital Growth</p><h1 className="text-2xl font-bold">Admin control center</h1><p className="text-sm text-slate-500">Signed in as {user.email}</p></header><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([x,n])=><div key={String(x)} className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{x}</p><p className="mt-2 text-3xl font-bold">{n}</p></div>)}</div><PlatformRevenue/><MediaManager items={media.data??[]}/><AdminManager users={users.data??[]} businesses={businesses.data??[]} campaigns={campaigns.data??[]} ads={ads.data??[]} leads={leads.data??[]} referrals={referrals.data??[]}/></div></main>;
}