"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LeadManager({initial}:{initial:any[]}) {
 const [rows,setRows]=useState(initial);
 const [message,setMessage]=useState("");
 const s=createClient();
 async function update(id:string,status:string){
  const {data,error}=await s.from("leads").update({status,updated_at:new Date().toISOString()}).eq("id",id).select().single();
  if(error){setMessage(error.message);return;}
  setRows(rows.map(x=>x.id===id?data:x)); setMessage("Lead updated.");
 }
 return <div>{message&&<p className="mb-3 text-sm text-slate-600">{message}</p>}
 {rows.length?<div className="space-y-3">{rows.map(l=><div key={l.id} className="rounded-xl border p-4">
 <div className="flex flex-wrap items-center justify-between gap-2"><strong>{l.name}</strong>
 <select value={l.status} onChange={e=>update(l.id,e.target.value)} className="rounded-lg border p-2 text-xs">
 <option>new</option><option>contacted</option><option>qualified</option><option>converted</option><option>closed</option>
 </select></div><p className="mt-2 text-sm text-slate-600">{l.message||"No message"}</p><div className="mt-3 flex flex-wrap items-center gap-3"><p className="text-xs text-slate-400">{l.phone||l.email||"No contact details"} · {l.source||"business_page"}</p>{l.phone&&<a href={"tel:"+l.phone} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">Call</a>}{l.phone&&<a href={"https://wa.me/"+String(l.phone).replace(/\D/g,"")} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">WhatsApp</a>}</div>
 </div>)}</div>:<p className="text-sm text-slate-500">No leads yet.</p>}</div>;
}