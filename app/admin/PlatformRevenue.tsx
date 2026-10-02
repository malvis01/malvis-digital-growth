"use client";
import {useEffect,useState} from "react";
export default function PlatformRevenue(){
 const [data,setData]=useState<any>(null),[form,setForm]=useState({amount:"",bankName:"",accountName:"",accountNumber:""}),[msg,setMsg]=useState("");
 const [ledgerFilter,setLedgerFilter]=useState("");
 async function load(){const r=await fetch("/api/admin/platform-withdrawals");setData(await r.json())}
 useEffect(()=>{load()},[]);
 async function updateWithdrawal(id:string,status:string,reason=""){const r=await fetch("/api/admin/platform-withdrawals",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status,reason})});const j=await r.json();setMsg(j.error||"Platform withdrawal updated.");if(r.ok)load();}

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
  <div className="mt-6"><h3 className="font-semibold">Platform withdrawal requests</h3><div className="mt-2 space-y-2">{(data.withdrawals||[]).map((w:any)=><div key={w.id} className="rounded-xl border p-3 text-sm"><div className="flex justify-between gap-3"><span>₦{Number(w.amount_ngn).toLocaleString()} · {w.bank_name} · {w.account_name}</span><strong>{w.status}</strong></div>{w.rejection_reason&&<p className="mt-2 text-xs text-red-600">Reason: {w.rejection_reason}</p>}{w.status==="pending"&&<div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>updateWithdrawal(w.id,"processing")} className="rounded-lg border px-3 py-2 text-xs font-semibold">Processing</button><button onClick={()=>updateWithdrawal(w.id,"paid")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Mark paid</button><button onClick={()=>{const reason=window.prompt("Reason for rejection?");if(reason?.trim())updateWithdrawal(w.id,"rejected",reason.trim())}} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">Reject</button></div>}</div>)}</div></div>
  <div className="mt-6"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Ledger</h3><input value={ledgerFilter} onChange={e=>setLedgerFilter(e.target.value)} placeholder="Search ledger" className="rounded-lg border px-3 py-2 text-sm"/></div><div className="mt-2 max-h-80 space-y-2 overflow-auto">{(data.ledger||[]).filter((x:any)=>JSON.stringify(x).toLowerCase().includes(ledgerFilter.toLowerCase())).map((x:any)=><div key={x.id} className="rounded-xl border p-3 text-sm"><div className="flex justify-between"><span>{x.entry_type}</span><strong>₦{Number(x.amount_ngn||0).toLocaleString()}</strong></div><p className="text-xs text-slate-500">{x.status} · {x.created_at?new Date(x.created_at).toLocaleString():""}</p></div>)}</div></div>
 </section>
}