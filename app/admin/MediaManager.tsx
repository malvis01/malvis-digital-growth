"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const hosts=["facebook.com","fb.watch","instagram.com","youtube.com","youtu.be","tiktok.com","x.com","twitter.com"];
function validUrl(value:string){try{const u=new URL(value);return u.protocol==="https:" && hosts.some(h=>u.hostname===h||u.hostname.endsWith("."+h));}catch{return false}}

export default function MediaManager({items}:{items:any[]}){
 const [rows,setRows]=useState(items);
 const [form,setForm]=useState({title:"",description:"",category:"",url:""});
 const [upload,setUpload]=useState({title:"",description:"",category:""});
 const [file,setFile]=useState<File|null>(null);
 const [uploading,setUploading]=useState(false);

 async function change(id:string,status:string){
   const s=createClient();
   const r=await s.from("media_items").update({status,published_at:status==="approved"?new Date().toISOString():null}).eq("id",id);
   if(!r.error)setRows(rows=>rows.map(x=>x.id===id?{...x,status}:x));
 }

 async function addExternal(e:React.FormEvent){
   e.preventDefault();
   if(!form.title||!validUrl(form.url))return alert("Enter a title and a valid supported social-media HTTPS link.");
   const s=createClient(); const {data:{user}}=await s.auth.getUser(); if(!user)return;
   const {data,error}=await s.from("media_items").insert({
     owner_id:user.id,title:form.title,description:form.description,category:form.category,
     media_kind:"video",source_type:"external",source_url:form.url,
     rights_confirmed:true,download_allowed:false,status:"pending"
   }).select("id,title,media_kind,status,created_at").single();
   if(error)return alert(error.message);
   setRows(x=>[data,...x]);setForm({title:"",description:"",category:"",url:""});
 }

 async function addUpload(e:React.FormEvent){
   e.preventDefault();
   if(!file||!upload.title.trim())return alert("Choose a video and enter a title.");
   if(!file.type.startsWith("video/"))return alert("Please choose a video file.");
   if(file.size>100*1024*1024)return alert("Video must be 100 MB or smaller.");
   setUploading(true);
   try{
     const duration=await new Promise<number|null>(resolve=>{
       const v=document.createElement("video"); v.preload="metadata";
       v.onloadedmetadata=()=>{URL.revokeObjectURL(v.src);resolve(Number.isFinite(v.duration)?Math.ceil(v.duration):null)};
       v.onerror=()=>resolve(null); v.src=URL.createObjectURL(file);
     });
     if(duration===null)throw new Error("We could not read the video duration. Please choose a standard video file.");
     if(duration>120)throw new Error("Business promotion videos can be up to 2 minutes. Admin uploads should also stay within 2 minutes for consistency.");
     const s=createClient(); const {data:{user}}=await s.auth.getUser(); if(!user)throw new Error("Your admin session has expired. Please log in again.");
     const ext=file.name.split(".").pop()||"mp4";
     const path=user.id+"/admin/"+crypto.randomUUID()+"."+ext;
     const up=await s.storage.from("media").upload(path,file,{contentType:file.type,upsert:false});
     if(up.error)throw up.error;
     const ins=await s.from("media_items").insert({
       owner_id:user.id,title:upload.title.trim(),description:upload.description.trim()||null,
       category:upload.category.trim()||null,media_kind:"video",source_type:"upload",
       storage_path:path,source_url:null,duration_seconds:duration,rights_confirmed:true,
       download_allowed:false,status:"pending"
     }).select("id,title,media_kind,status,created_at").single();
     if(ins.error){await s.storage.from("media").remove([path]);throw ins.error;}
     setRows(x=>[ins.data,...x]);setFile(null);setUpload({title:"",description:"",category:""});
     alert("Video uploaded successfully and submitted for approval.");
   }catch(err){alert(err instanceof Error?err.message:"Video upload failed.");}
   finally{setUploading(false);}
 }

 return <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
  <h2 className="text-lg font-bold">Media moderation & uploads</h2>
  <p className="text-sm text-slate-500">Admin can upload a video directly from a phone or paste an authorized public social-media link.</p>

  <form onSubmit={addUpload} className="mt-4 grid gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
   <h3 className="font-semibold">Upload video from phone</h3>
   <input required value={upload.title} onChange={e=>setUpload({...upload,title:e.target.value})} placeholder="Video title" className="rounded-lg border bg-white px-3 py-2"/>
   <input value={upload.category} onChange={e=>setUpload({...upload,category:e.target.value})} placeholder="Category" className="rounded-lg border bg-white px-3 py-2"/>
   <textarea value={upload.description} onChange={e=>setUpload({...upload,description:e.target.value})} placeholder="Description" className="rounded-lg border bg-white px-3 py-2"/>
   <input required type="file" accept="video/*" capture="environment" onChange={e=>setFile(e.target.files?.[0]||null)} className="rounded-lg border bg-white px-3 py-2"/>
   <p className="text-xs text-slate-500">Maximum 100 MB · maximum 2 minutes · works with phone gallery and camera-supported browsers.</p>
   <label className="flex gap-2 text-sm text-slate-600"><input type="checkbox" required/> I confirm I own or have permission to publish this video.</label>
   <button disabled={uploading} className="rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{uploading?"Uploading...":"Upload video for approval"}</button>
  </form>

  <form onSubmit={addExternal} className="mt-4 grid gap-3 rounded-xl border p-4">
   <h3 className="font-semibold">Add social-media video link</h3>
   <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Video title" className="rounded-lg border px-3 py-2"/>
   <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Category" className="rounded-lg border px-3 py-2"/>
   <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description" className="rounded-lg border px-3 py-2"/>
   <input required type="url" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://youtube.com/... or https://facebook.com/..." className="rounded-lg border px-3 py-2"/>
   <button className="rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white">Submit social video for approval</button>
  </form>

  <div className="mt-4 space-y-3">{rows.map(i=><div key={i.id} className="rounded-xl border p-4">
   <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div><p className="font-semibold">{i.title}</p><p className="text-xs text-slate-500">{i.media_kind} · {i.status} · {i.view_count||0} views</p></div>
    {i.status==="pending"&&<div className="flex gap-2"><button onClick={()=>change(i.id,"approved")} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Approve</button><button onClick={()=>change(i.id,"rejected")} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Reject</button></div>}
   </div>
  </div>)}</div>
 </section>;
}
