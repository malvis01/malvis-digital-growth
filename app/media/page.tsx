import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function MediaPage(){
 const s=await createClient();
 const {data:items}=await s.from("media_items").select("*").eq("status","approved").order("created_at",{ascending:false}).limit(100);
 return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-6xl"><Link href="/" className="font-bold">Malvis Digital Growth</Link><h1 className="mt-8 text-3xl font-black">Movies & Videos</h1><p className="mt-2 text-slate-500">Approved movies, videos and business promotions.</p><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{(items||[]).map((m:any)=><article key={m.id} className="rounded-2xl bg-white p-4 shadow-sm"><h2 className="font-bold">{m.title}</h2><p className="mt-2 text-sm text-slate-500">{m.description||m.media_kind}</p>{m.source_url&&<a className="mt-4 inline-block rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white" href={m.source_url} target="_blank" rel="noreferrer">Watch</a>}</article>)}</div></div></main>
}