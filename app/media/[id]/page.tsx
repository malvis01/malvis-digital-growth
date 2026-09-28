import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { detectPlatform, getEmbedUrl } from "../media-utils";

export default async function MediaDetail({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const s=await createClient();
 const {data:m}=await s.from("media_items").select("*").eq("id",id).eq("status","approved").maybeSingle();
 if(!m) notFound();
 const platform=detectPlatform(m.source_url||""); const embed=getEmbedUrl(m.source_url||"",platform);
 return <main className="min-h-screen bg-slate-50 p-5"><article className="mx-auto max-w-3xl">
  <Link href="/media" className="text-sm font-semibold">← Movies & Videos</Link>
  <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">
   {embed ? <div className="aspect-video bg-black"><iframe src={embed} title={m.title} className="h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowFullScreen/></div> : m.source_url ? <div className="p-8 text-center"><p className="font-semibold">This video is hosted on another platform.</p></div> : null}
   <div className="p-6"><p className="text-xs font-bold uppercase text-indigo-600">{platform || m.media_kind}</p><h1 className="mt-2 text-3xl font-black">{m.title}</h1><p className="mt-3 text-slate-600">{m.description}</p>
   <div className="mt-6 flex flex-wrap gap-2"><a href={m.source_url||"#"} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white">Watch original</a><button className="rounded-lg border px-4 py-2 font-semibold" data-share-url={`/media/${m.id}`}>Share this page</button></div>
   <p className="mt-4 text-xs text-slate-500">Share this Malvis page so your audience can discover the video here. Views on Facebook, Instagram, YouTube, TikTok or other platforms remain counted by those platforms.</p>
   </div>
  </div>
 </article></main>;
}