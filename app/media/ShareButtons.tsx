"use client";
import { useState } from "react";
export default function ShareButtons({title}:{title:string}){
 const [done,setDone]=useState(false);
 async function share(){
  const url=window.location.href;
  if(navigator.share){await navigator.share({title,url});return}
  await navigator.clipboard.writeText(url);setDone(true);setTimeout(()=>setDone(false),1800);
 }
 const u=encodeURIComponent(window.location.href),t=encodeURIComponent(title);
 return <div className="flex flex-wrap gap-2">
  <button onClick={share} className="rounded-lg border px-4 py-2 font-semibold">{done?"Copied!":"Share this page"}</button>
  <a target="_blank" rel="noreferrer" href={`https://wa.me/?text=${t}%20${u}`} className="rounded-lg border px-4 py-2 font-semibold">WhatsApp</a>
  <a target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} className="rounded-lg border px-4 py-2 font-semibold">Facebook</a>
  <a target="_blank" rel="noreferrer" href={`https://x.com/intent/post?text=${t}&url=${u}`} className="rounded-lg border px-4 py-2 font-semibold">X</a>
 </div>
}