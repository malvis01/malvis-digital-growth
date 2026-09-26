import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";

export default async function Offers(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect("/login");
 const {data:b}=await s.from("businesses").select("id").eq("owner_id",user.id).limit(1).maybeSingle();
 const {data:p}=b?await s.from("products").select("id,name,price_ngn,active").eq("business_id",b.id).order("created_at",{ascending:false}):{data:[]};
 const {data:sv}=b?await s.from("services").select("id,name,price_ngn,active").eq("business_id",b.id).order("created_at",{ascending:false}):{data:[]};
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Section title="Products & services" description="Manage the offers customers can discover." href="/dashboard"><div className="grid gap-4 md:grid-cols-2">{[["Products",p],["Services",sv]].map(([label,items])=><div key={String(label)} className="rounded-xl border p-4"><h2 className="font-semibold">{label}</h2>{items?.length?<ul className="mt-3 space-y-2">{items.map((x:any)=><li key={x.id} className="flex justify-between border-b pb-2 text-sm"><span>{x.name}</span><span>{x.price_ngn==null?"Contact":"NGN "+Number(x.price_ngn).toLocaleString()}</span></li>)}</ul>:<p className="mt-3 text-sm text-slate-500">Nothing added yet.</p>}</div>)}</div></Section></div></main>;
}