"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MediaUploader({userId,businessId,businessName,monthlyUsed,paidPlan}:{userId:string;businessId:string;businessName:string;monthlyUsed:number;paidPlan:boolean}){
 const [file,setFile]=useState<File|null>(null),[title,setTitle]=useState(""),[description,setDescription]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function submit(e:React.FormEvent){
  e.preventDefault();setMessage("");
  if(!paidPlan && monthlyUsed >= 2){setMessage("You have used your 2 free business promotion videos for this month. Please upgrade to a paid plan to post more.");return}\n  if(!file||!title.trim()){setMessage("Add a video and title.");return}
  if(!file.type.startsWith("video/")){setMessage("Please select a video file.");return}
  if(file.size>100*1024*1024){setMessage("Video must be 100 MB or smaller.");return}
  setBusy(true);
  const duration=await new Promise<number|null>(resolve=>{const v=document.createElement("video");v.preload="metadata";v.onloadedmetadata=()=>{URL.revokeObjectURL(v.src);resolve(Number.isFinite(v.duration)?Math.ceil(v.duration):null)};v.onerror=()=>resolve(null);v.src=URL.createObjectURL(file)});
  if(duration===null){setMessage("We could not read the video duration. Please choose a standard video file.");setBusy(false);return}
  if(duration>120){setMessage("Business promotion videos can be up to 2 minutes (120 seconds). Please choose a shorter video.");setBusy(false);return}
  const s=createClient();const ext=file.name.split(".").pop()||"mp4";const path=userId+"/business/"+crypto.randomUUID()+"."+ext;
  const up=await s.storage.from("media").upload(path,file,{contentType:file.type});
  if(up.error){setMessage(up.error.message);setBusy(false);return}
  const {data:url}=s.storage.from("media").getPublicUrl(path);
  const ins=await s.from("media_items").insert({owner_id:userId,business_id:businessId,media_kind:"business_promotion",title:title.trim(),description:description.trim()||null,source_type:"upload",storage_path:path,source_url:url.publicUrl,duration_seconds:duration,rights_confirmed:true,download_allowed:false,status:"pending"});
  if(ins.error){await s.storage.from("media").remove([path]);setMessage(ins.error.message.includes("free plan includes")?"You have used your 2 free business promotion videos for this month. Please upgrade to a paid plan to post more videos.":ins.error.message);setBusy(false);return}
  setFile(null);setTitle("");setDescription("");setMessage("Submitted. Your video is waiting for admin review.");setBusy(false);
 }
 return <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-indigo-600">{businessName}</p><h2 className="mt-1 text-xl font-bold">Promote your business</h2><div className="mt-5 grid gap-4"><div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-slate-700"><strong>{paidPlan?"Paid plan":"Free plan"}:</strong> {paidPlan?"Your paid plan allows additional promotion videos.":"2 business promotion videos per month."} <span className="font-semibold">{paidPlan?"Paid plan active":`${monthlyUsed}/2 free videos used this month`}</span> {paidPlan?"":"After your 2 free posts, upgrade to a paid plan to post more."}{!paidPlan && monthlyUsed>=2 && <a href="/dashboard/plans" className="mt-2 inline-block font-semibold text-indigo-700 underline">View paid plans →</a>}</div><label className="text-sm font-medium">Video<input className="mt-2 block w-full rounded-xl border p-3 text-sm" type="file" accept="video/*" onChange={e=>setFile(e.target.files?.[0]||null)}/><span className="mt-1 block text-xs text-slate-500">Maximum 100 MB. Videos are reviewed before publishing.</span></label><input className="rounded-xl border p-3" placeholder="Video title" value={title} onChange={e=>setTitle(e.target.value)}/><textarea className="rounded-xl border p-3" rows={4} placeholder="Tell people what your business offers..." value={description} onChange={e=>setDescription(e.target.value)}/><label className="flex gap-2 text-sm text-slate-600"><input type="checkbox" required/> I confirm I own or have permission to publish this video.</label><button disabled={busy || (!paidPlan && monthlyUsed>=2)} className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?"Uploading...":(!paidPlan && monthlyUsed>=2?"Upgrade to post more":"Submit video for review")}</button>{message&&<p className="text-sm text-slate-600">{message}</p>}</div></form>
}