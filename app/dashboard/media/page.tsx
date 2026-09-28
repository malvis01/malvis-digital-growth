import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MediaUploader from "./MediaUploader";

export default async function MediaPage(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect("/login");
 const {data:business}=await s.from("businesses").select("id,name").eq("owner_id",user.id).limit(1).maybeSingle();
 let used=0; let paid=false;
 if(business){
   const monthStart=new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0,0,0,0);
   const monthEnd=new Date(monthStart); monthEnd.setUTCMonth(monthEnd.getUTCMonth()+1);
   const [{count},{data:sub}]=await Promise.all([
     s.from("media_items").select("id",{count:"exact",head:true}).eq("business_id",business.id).eq("media_kind","business_promotion").gte("created_at",monthStart.toISOString()).lt("created_at",monthEnd.toISOString()),
     s.from("subscriptions").select("id,plans!inner(price_ngn)").eq("business_id",business.id).eq("status","active").gt("ends_at",new Date().toISOString()).gt("plans.price_ngn",0).limit(1)
   ]);
   used=count||0; paid=!!sub?.length;
 }
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><div className="mb-5"><h1 className="text-2xl font-bold">Business video promotion</h1><p className="mt-1 text-sm text-slate-500">Upload short videos of your business, products or services. Videos can be up to 2 minutes and are reviewed before publishing.</p></div>{business?<MediaUploader userId={user.id} businessId={business.id} businessName={business.name} monthlyUsed={used} paidPlan={paid}/>:<div className="rounded-2xl bg-white p-6 shadow-sm">Create your business profile first.</div>}</div></main>;
}