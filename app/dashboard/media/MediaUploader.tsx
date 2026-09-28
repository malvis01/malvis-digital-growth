"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MediaUploader({userId,businessId,businessName}:{userId:string;businessId:string;businessName:string}){
 const [file,setFile]=useState<File|null>(null),[title,setTitle]=useState(""),[description,setDescription]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function submit(e:React.FormEvent){
  e.preventDefault();setMessage("");
  if(!file||!title.trim()){setMessage("Add a video and title.");return}
  if(!file.type.startsWith("video/")){setMessage("Please select a video file.");return}
  if(file.size>100*1024*1024){setMessage("Video must be 100 MB or smaller.");return}
  setBusy(true);const s=createClient();const ext=file.name.split(".").pop()||"mp4";const path=userId+"/business/"+crypto.randomUUID()+"."+ext;
  const up=await s.storage.from("media").upload(path,file,{contentType:file.type});
  if(up.error){setMessage(up.error.message);setBusy(false);return}
  const {data:url}=s.storage.from("media").getPublicUrl(path);
  const ins=await s.from("media_items").insert({owner_id:userId,business_id:businessId,media_kind:"business_promotion",title:title.trim(),description:description.trim()||null,source_type:"upload",storage_path:path,source_url:url.publicUrl,rights_confirmed:true,download_allowed:false,status:"pending"});
  if(ins.error){await s.storage.from("media").remove([path]);setMessage(ins.error.message);setBusy(false);return}
  setFile(null);setTitle("");setDescription("");setMessage("Submitted. Your video is waiting for admin review.");setBusy(false);
 }
 return <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-indigo-600">{businessName}</p><h2 className="mt-1 text-xl font-bold">Promote your business</h2><div className="mt-5 grid gap-4"><label className="text-sm font-medium">Video<input className="mt-2 block w-full rounded-xl border p-3 text-sm" type="file" accept="video/*" onChange={e=>setFile(e.target.files?.[0]||null)}/><span className="mt-1 block text-xs text-slate-500">Maximum 100 MB. Videos are reviewed before publishing.</span></label><input className="rounded-xl border p-3" placeholder="Video title" value={title} onChange={e=>setTitle(e.target.value)}/><textarea className="rounded-xl border p-3" rows={4} placeholder="Tell people what your business offers..." value={description} onChange={e=>setDescription(e.target.value)}/><label className="flex gap-2 text-sm text-slate-600"><input type="checkbox" required/> I confirm I own or have permission to publish this video.</label><button disabled={busy} className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?"Uploading...":"Submit video for review"}</button>{message&&<p className="text-sm text-slate-600">{message}</p>}</div></form>
}