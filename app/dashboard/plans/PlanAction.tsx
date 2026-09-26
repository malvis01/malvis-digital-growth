"use client";
import {useState} from "react";

export default function PlanAction({planId,paid}:{planId:string;paid:boolean}){
 const [busy,setBusy]=useState(false),[msg,setMsg]=useState(""),[email,setEmail]=useState("");
 async function go(){
  setBusy(true);setMsg("");
  if(paid&&!/^\S+@\S+\.\S+$/.test(email.trim())){setMsg("Enter a valid billing email for Paystack checkout.");setBusy(false);return;}
  const r=await fetch("/api/payments/initialize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({planId,billingEmail:email.trim()})});
  const j=await r.json();
  if(j.authorization_url){window.location.href=j.authorization_url;return;}
  setMsg(j.error||"Plan activated.");setBusy(false);
 }
 return <div>
  {paid&&<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Billing email for payment" className="mt-5 w-full rounded-xl border p-3 text-sm" required />}
  <button onClick={go} disabled={busy} className="mt-3 rounded-xl bg-black px-4 py-2 text-sm text-white">{busy?"Processing...":paid?"Pay & activate":"Activate free plan"}</button>
  {msg&&<p className="mt-2 text-xs text-red-600">{msg}</p>}
 </div>;
}