import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { detectPlatform, getEmbedUrl } from "./media-utils";

export default async function MediaPage(){
 const s=await createClient();
 const {data:items}=await s.from("media_items").select("*").eq("status","approved").order("created_at",{ascending:false}).limit(100);
 return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-6xl">
  <Link href="/" className="font-bold">Malvis Digital Growth</Link>
  <h1 className="mt-8 text-3xl font-black">Movies & Videos</h1>
  <p className="mt-2 text-slate-500">Movies, business promotions and links to permitted social-media videos.</p>
  <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
   {(items||[]).map((m:any)=>{
    const platform=detectPlatform(m.source_url||""); const embed=getEmbedUrl(m.source_url||"",platform);
    return <article key={m.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {embed ? <div className="aspect-video bg-black"><iframe src={embed} title={m.title} className="h-full w-full border-0" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowFullScreen /></div> : m.poster_url ? <img src={m.poster_url} alt="" className="aspect-video w-full object-cover"/> : null}
      <div className="p-4"><p className="text-xs font-semibold uppercase text-indigo-600">{platform || m.media_kind}</p><h2 className="mt-1 font-bold">{m.title}</h2><p className="mt-2 text-sm text-slate-500">{m.description||"Watch this video on Malvis Digital Growth."}</p>
      <div className="mt-4 flex flex-wrap gap-2">{m.source_url&&<a className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white" href={m.source_url} target="_blank" rel="noreferrer">Watch original</a>}<a className="rounded-lg border px-4 py-2 text-sm font-semibold" href={`/media/${m.id}`}>Open page & share</a></div></div>
    </article>
   })}
  </div>
 </div></main>
}