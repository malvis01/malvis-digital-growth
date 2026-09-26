import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";
import CampaignManager from "./CampaignManager";

export default async function Campaigns(){
 const s=await createClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user) redirect("/login");
 const {data:b}=await s.from("businesses").select("id").eq("owner_id",user.id).limit(1).maybeSingle();
 if(!b) return <main className="p-6">Create a business profile first.</main>;
 const {data:rows}=await s.from("campaigns").select("id,name,objective,budget_ngn,status").eq("business_id",b.id).order("created_at",{ascending:false});
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Section title="Campaigns" description="Plan, budget and monitor marketing campaigns." href="/dashboard"><CampaignManager businessId={b.id} initial={rows??[]}/></Section></div></main>;
}
