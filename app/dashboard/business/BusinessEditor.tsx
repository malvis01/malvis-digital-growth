"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BusinessEditor({business}:{business:any}) {
 const [form,setForm]=useState({name:business?.name??"",category:business?.category??"",phone:business?.phone??"",whatsapp:business?.whatsapp??"",email:business?.email??"",address:business?.address??"",city:business?.city??"",state:business?.state??"",website_url:business?.website_url??""});
 const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false);
 const save=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setMessage("");const s=createClient();const {error}=await s.from("businesses").update(form).eq("id",business.id);setMessage(error?error.message:"Business profile updated successfully.");setLoading(false);};
 return <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">{Object.entries(form).map(([key,value])=><label key={key} className="text-sm font-medium capitalize">{key.replaceAll("_"," ")}<input className="mt-1 w-full rounded-xl border p-3 font-normal" value={String(value)} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}<div className="sm:col-span-2 flex items-center gap-3"><button disabled={loading} className="rounded-xl bg-black px-5 py-3 text-sm text-white disabled:opacity-50">{loading?"Saving...":"Save profile"}</button>{message&&<span className="text-sm text-slate-600">{message}</span>}</div></form>;
}