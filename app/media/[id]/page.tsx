import { notFound } from "next/navigation";
import Link from "next/link";
import MediaActions from "../MediaActions";
import { createClient } from "@/lib/supabase/server";
import { detectPlatform, getEmbedUrl } from "../media-utils";
import ShareButtons from "../ShareButtons";
import MediaViewTracker from "../MediaViewTracker";

export async function generateMetadata({params}:{params:Promise<{id:string}>}){\n const {id}=await params; const s=await createClient(); const {data:m}=await s.from("media_items").select("title,description,poster_url").eq("id",id).eq("status","approved").maybeSingle();\n return {title:m?.title?`${m.title} | Malvis Digital Growth`:"Malvis Digital Growth",description:m?.description||"Watch this video on Malvis Digital Growth.",openGraph:{title:m?.title||"Malvis Digital Growth",description:m?.description||"Watch this video on Malvis Digital Growth.",images:m?.poster_url?[m.poster_url]:[]}};\n}\n\nexport default async function MediaDetail({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const s=await createClient();
 const {data:m}=await s.from("media_items").select("*").eq("id",id).eq("status","approved").maybeSingle();
 if(!m) notFound();
 const platform=detectPlatform(m.source_url||""); const embed=getEmbedUrl(m.source_url||"",platform);
 const {count}=await s.from("media_views").select("*",{count:"exact",head:true}).eq("media_id",id);
 return <main className="min-h-screen bg-slate-50 p-5"><MediaViewTracker mediaId={id}/><article className="mx-auto max-w-3xl">
  <Link href="/media" className="text-sm font-semibold">← Movies & Videos</Link>
  <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">
   {embed ? <div className="aspect-video bg-black"><iframe src={embed} title={m.title} className="h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowFullScreen/></div> : m.source_url ? <div className="p-8 text-center"><p className="font-semibold">This video is hosted on another platform.</p></div> : null}
   <div className="p-6"><p className="text-xs font-bold uppercase text-indigo-600">{platform || m.media_kind}</p><h1 className="mt-2 text-3xl font-black">{m.title}</h1><p className="mt-3 text-slate-600">{m.description}</p>
   <div className="mt-5"><ShareButtons title={m.title}/></div>
   <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500"><span>{count||0} Malvis page views</span>{m.category&&<span>• {m.category}</span>}</div>
   <div className="mt-5"><a href={m.source_url||"#"} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white">Watch original</a></div>
   <p className="mt-4 text-xs text-slate-500">Sharing this page helps your audience discover the content on Malvis. Views reported here are Malvis page views; views on the original social platform remain separate.</p>
   </div>
  </div>
 </article></main>;
}