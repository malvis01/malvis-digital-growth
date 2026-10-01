"use client";
import {useEffect,useState} from "react";
export default function PlatformRevenue(){
 const [data,setData]=useState<any>(null),[form,setForm]=useState({amount:"",bankName:"",accountName:"",accountNumber:""}),[msg,setMsg]=useState("");
 async function load(){const r=await fetch("/api/admin/platform-withdrawals");setData(await r.json())}
 useEffect(()=>{load()},[]);
 async function submit(e:any){e.preventDefault();setMsg("");const r=await fetch("/api/admin/platform-withdrawals",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const j=await r.json();setMsg(j.error||"Withdrawal request created.");if(r.ok){setForm({amount:"",bankName:"",accountName:"",accountNumber:""});load()}}
 if(!data)return <p className="mt-6 text-sm text-slate-500">Loading platform revenue...</p>;
 return <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
  <h2 className="text-lg font-semibold">Platform money & revenue</h2>
  <p className="mt-1 text-sm text-slate-500">Gross paid is the total money successfully paid through the platform. Platform revenue is the amount currently recorded as Malvis Digital Growth commission income.</p>
  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
   {[
    ["Gross payments",data.grossPaid],
    ["Plan payments",data.subscriptionGross],
    ["Advertising payments",data.advertisingGross],
    ["Marketing services",data.serviceGross],
    ["Platform revenue",data.platformRevenue],
    ["Referral payable",data.referralPending],
    ["Provider fees",data.providerFees],
    ["Withdrawn",data.withdrawn],
    ["Available to withdraw",data.available]
   ].map(([label,value])=><div key={String(label)} className="rounded-xl border p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">₦{Number(value||0).toLocaleString()}</p></div>)}
  </div>
  <p className="mt-3 text-xs text-slate-500">Provider fees are read from Paystack transaction data when Paystack supplies a fee value. They are shown separately and are not treated as platform revenue.</p>
  <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2">
   <input className="rounded-xl border p-3" placeholder="Amount" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
   <input className="rounded-xl border p-3" placeholder="Bank name" value={form.bankName} onChange={e=>setForm({...form,bankName:e.target.value})}/>
   <input className="rounded-xl border p-3" placeholder="Account name" value={form.accountName} onChange={e=>setForm({...form,accountName:e.target.value})}/>
   <input className="rounded-xl border p-3" placeholder="10-digit account number" value={form.accountNumber} onChange={e=>setForm({...form,accountNumber:e.target.value})}/>
   <button className="rounded-xl bg-black p-3 text-white sm:col-span-2">Request platform withdrawal</button>
  </form>
  {msg&&<p className="mt-3 text-sm">{msg}</p>}
  <div className="mt-6 space-y-2">{(data.withdrawals||[]).map((w:any)=><div key={w.id} className="flex justify-between rounded-xl border p-3 text-sm"><span>₦{Number(w.amount_ngn).toLocaleString()} · {w.bank_name}</span><strong>{w.status}</strong></div>)}</div>
 </section>
}