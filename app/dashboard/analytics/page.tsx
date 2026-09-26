import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";

export default async function Analytics(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect("/login");
 const {data:b}=await s.from("businesses").select("id").eq("owner_id",user.id).limit(1).maybeSingle();
 const {data:events}=b?await s.from("analytics_events").select("event_type,created_at").eq("business_id",b.id).order("created_at",{ascending:false}).limit(100):{data:[]};
 const counts=(events||[]).reduce((a:any,e:any)=>{a[e.event_type]=(a[e.event_type]||0)+1;return a},{} as Record<string,number>);
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Section title="Analytics" description="Recent growth activity." href="/dashboard"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(counts).map(([k,v])=><div key={k} className="rounded-xl border p-4"><p className="text-sm text-slate-500">{k.replaceAll("_"," ")}</p><p className="mt-2 text-3xl font-bold">{String(v)}</p></div>)}</div>{!events?.length&&<p className="text-sm text-slate-500">Analytics will appear as customers interact with your business.</p>}</Section></div></main>;
}