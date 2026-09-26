import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";
import BusinessEditor from "./BusinessEditor";

export default async function BusinessPage() {
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect("/login");
 const {data:business}=await s.from("businesses").select("*").eq("owner_id",user.id).limit(1).maybeSingle();
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Section title="Business profile" description="Update the information customers see." href="/dashboard">{business?<BusinessEditor business={business}/>:<p>No business profile found.</p>}</Section></div></main>;
}