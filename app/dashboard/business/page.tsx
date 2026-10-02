import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";
import BusinessEditor from "./BusinessEditor";

export default async function BusinessPage() {
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect("/login");
 const {data:business}=await s.from("businesses").select("*").eq("owner_id",user.id).limit(1).maybeSingle();
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Section title="Business profile" description="This information powers your public business page and customer enquiries." href="/dashboard">{business?<BusinessEditor business={business}/>:<div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-bold text-amber-950">Business profile not found</h2><p className="mt-2 text-sm text-amber-900">Your account was created, but your business profile was not created yet. Please contact support so we can restore it without losing your account.</p></div>}</Section></div></main>;
}