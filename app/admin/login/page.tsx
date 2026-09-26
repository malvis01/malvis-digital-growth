"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const router=useRouter();
 async function submit(e:React.FormEvent){e.preventDefault();setError("");const s=createClient();const {error}=await s.auth.signInWithPassword({email,password});if(error){setError(error.message);return;}router.push("/admin");router.refresh();}
 return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-indigo-600">Malvis Digital Growth</p><h1 className="mt-1 text-2xl font-bold">Admin login</h1><input required type="email" className="mt-6 w-full rounded-xl border p-3" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)}/><input required type="password" className="mt-3 w-full rounded-xl border p-3" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>{error&&<p className="mt-3 text-sm text-red-600">{error}</p>}<button className="mt-4 w-full rounded-xl bg-black p-3 text-white">Sign in</button></form></main>;
}