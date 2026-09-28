"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MediaManager({items}:{items:any[]}){
 const [rows,setRows]=useState(items);
 async function change(id:string,status:string){
  const s=createClient();const r=await s.from("media_items").update({status,published_at:status==="approved"?new Date().toISOString():null}).eq("id",id);
  if(!r.error)setRows(rows=>rows.map(x=>x.id===id?{...x,status}:x));
 }
 return <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">Media moderation</h2><p className="text-sm text-slate-500">Approve or reject uploaded business videos and other media.</p><div className="mt-4 space-y-3">{rows.map(i=><div key={i.id} className="rounded-xl border p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{i.title}</p><p className="text-xs text-slate-500">{i.media_kind} · {i.status}</p></div>{i.status==="pending"&&<div className="flex gap-2"><button onClick={()=>change(i.id,"approved")} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Approve</button><button onClick={()=>change(i.id,"rejected")} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Reject</button></div>}</div></div>)}</div></section>
}