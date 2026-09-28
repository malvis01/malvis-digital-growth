"use client";
import {useEffect,useState} from "react";
import {createClient} from "@/lib/supabase/client";

export default function MediaActions({mediaId}:{mediaId:string}){
 const [msg,setMsg]=useState("");
 useEffect(()=>{const key="media-view-"+mediaId;if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,"1");createClient().from("media_views").insert({media_id:mediaId});},[mediaId]);
 async function share(){
   const url=window.location.href;
   try{
     if(navigator.share){await navigator.share({title:document.title,url});setMsg("Shared.");return;}
     await navigator.clipboard.writeText(url);setMsg("Link copied.");
   }catch{}
 }
 const url=typeof window!=="undefined"?window.location.href:"";
 return <div className="mt-6 flex flex-wrap gap-2">
   <button onClick={share} className="rounded-lg border px-4 py-2 font-semibold">Share this page</button>
   {url&&<a href={`https://wa.me/?text=${encodeURIComponent("Watch this on Malvis Digital Growth: "+url)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white">WhatsApp</a>}
   {url&&<a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">Facebook</a>}
   {url&&<a href={`https://x.com/intent/post?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-black px-4 py-2 font-semibold text-white">X</a>}
   {msg&&<span className="self-center text-sm text-slate-500">{msg}</span>}
 </div>;
}