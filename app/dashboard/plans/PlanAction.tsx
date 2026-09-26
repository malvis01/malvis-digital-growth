"use client";
import {useState} from "react";
export default function PlanAction({planId,paid}:{planId:string;paid:boolean}){
 const [busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 async function go(){setBusy(true);setMsg("");const r=await fetch("/api/payments/initialize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({planId})});const j=await r.json();if(j.authorization_url){window.location.href=j.authorization_url;return;}setMsg(j.error||"Plan activated.");setBusy(false);}
 return <div><button onClick={go} disabled={busy} className="mt-5 rounded-xl bg-black px-4 py-2 text-sm text-white">{busy?"Processing...":paid?"Pay & activate":"Activate free plan"}</button>{msg&&<p className="mt-2 text-xs text-red-600">{msg}</p>}</div>;
}