import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MediaUploader from "./MediaUploader";

export default async function MediaPage(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect("/login");
 const {data:business}=await s.from("businesses").select("id,name").eq("owner_id",user.id).limit(1).maybeSingle();
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><div className="mb-5"><h1 className="text-2xl font-bold">Business video promotion</h1><p className="mt-1 text-sm text-slate-500">Upload a short video of your business, products or services. Videos can be up to 2 minutes and are reviewed before publishing.</p></div>{business?<MediaUploader userId={user.id} businessId={business.id} businessName={business.name}/>:<div className="rounded-2xl bg-white p-6 shadow-sm">Create your business profile first.</div>}</div></main>;
}