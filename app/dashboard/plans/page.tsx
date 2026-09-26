import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";
import PlanAction from "./PlanAction";
export default async function PlansPage(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user)redirect("/login");
 const {data:plans}=await s.from("plans").select("id,name,slug,price_ngn,billing_interval,description,features").eq("active",true).order("price_ngn");
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-5xl"><Section title="Plans & subscription" description="Choose the tools that match your growth stage." href="/dashboard"><div className="grid gap-4 md:grid-cols-3">{(plans||[]).map(p=><div key={p.id} className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold">{p.name}</h2><p className="mt-2 text-3xl font-bold">₦{Number(p.price_ngn).toLocaleString()}<span className="text-sm font-normal text-slate-500">/{p.billing_interval}</span></p><p className="mt-2 text-sm text-slate-500">{p.description}</p><ul className="mt-4 space-y-2 text-sm">{(Array.isArray(p.features)?p.features:[]).map((x:any)=><li key={x}>✓ {x}</li>)}</ul><PlanAction planId={p.id} paid={Number(p.price_ngn)>0}/></div>)}</div></Section></div></main>;
}