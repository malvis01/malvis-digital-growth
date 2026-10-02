import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LeadForm from "./LeadForm";

export default async function BusinessProfilePage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const s=await createClient();
  const {data:b}=await s.from("businesses").select("id,name,slug,description,category,phone,whatsapp,email,address,city,state,logo_url,website_url").eq("slug",slug).eq("status","active").maybeSingle();
  if(!b) notFound();
  const [{data:products},{data:services},{data:videos}]=await Promise.all([
    s.from("products").select("id,name,description,price_ngn,image_url").eq("business_id",b.id).eq("active",true).order("created_at",{ascending:false}),
    s.from("services").select("id,name,description,price_ngn").eq("business_id",b.id).eq("active",true).order("created_at",{ascending:false}),
    s.from("media_items").select("id,title,storage_path,source_url,poster_url").eq("business_id",b.id).eq("media_kind","business_promotion").eq("status","approved").order("created_at",{ascending:false}).limit(6)
  ]);
  const videoRows=await Promise.all((videos||[]).map(async(v:any)=>{if(v.source_url)return {...v,url:v.source_url};const {data}=v.storage_path?await s.storage.from("media").createSignedUrl(v.storage_path,3600):{data:null};return {...v,url:data?.signedUrl||null};}));
  return <main className="min-h-screen bg-slate-50">
    <header className="border-b bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><Link href="/businesses" className="font-bold">← Businesses</Link><Link href="/register" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">List your business</Link></div></header>
    <div className="mx-auto max-w-6xl px-5 py-10">
      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {b.logo_url?<img src={b.logo_url} alt="" className="h-24 w-24 rounded-3xl object-cover"/>:<div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-950 text-3xl font-black text-white">{b.name?.charAt(0)?.toUpperCase()}</div>}
        <div className="flex-1"><p className="text-sm font-bold uppercase tracking-wider text-indigo-600">{b.category||"Business"}</p><h1 className="mt-2 text-4xl font-black text-slate-950">{b.name}</h1><p className="mt-4 max-w-3xl leading-7 text-slate-600">{b.description||"Business profile on Malvis Digital Growth."}</p><p className="mt-4 text-sm text-slate-500">{[b.address,b.city,b.state].filter(Boolean).join(", ")}</p>
        <div className="mt-5 flex flex-wrap gap-2">{b.whatsapp&&<a href={"https://wa.me/"+String(b.whatsapp).replace(/\D/g,"")} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">WhatsApp</a>}{b.phone&&<a href={"tel:"+b.phone} className="rounded-xl border px-4 py-2 text-sm font-bold">Call</a>}{b.website_url&&<a href={b.website_url} target="_blank" rel="noreferrer" className="rounded-xl border px-4 py-2 text-sm font-bold">Website</a>}</div></div>
      </div></section>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {videoRows.length>0&&<section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Promotional videos</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{videoRows.map((v:any)=><div key={v.id} className="overflow-hidden rounded-2xl border">{v.url?<video src={v.url} poster={v.poster_url||undefined} controls playsInline className="aspect-video w-full bg-black"/>:null}<div className="p-3 font-semibold">{v.title}</div></div>)}</div></section>}
          <section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Products & services</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{[...(products||[]).map((x:any)=>({...x,kind:"Product"})),...(services||[]).map((x:any)=>({...x,kind:"Service"}))].map((x:any)=><article key={x.kind+x.id} className="rounded-2xl border p-4">{x.image_url&&<img src={x.image_url} alt="" className="mb-3 aspect-video w-full rounded-xl object-cover"/>}<p className="text-xs font-bold uppercase text-indigo-600">{x.kind}</p><h3 className="mt-1 font-bold">{x.name}</h3>{x.description&&<p className="mt-2 text-sm text-slate-600">{x.description}</p>}<p className="mt-3 font-bold">₦{Number(x.price_ngn||0).toLocaleString()}</p></article>)}</div>{!(products?.length||services?.length)&&<p className="mt-4 text-sm text-slate-500">This business has not added products or services yet.</p>}</section>
        </div>
        <aside><LeadForm businessId={b.id} businessName={b.name}/></aside>
      </div>
    </div>
  </main>;
}
