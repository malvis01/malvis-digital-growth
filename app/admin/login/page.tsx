"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const router=useRouter();

  async function submit(e:React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const s=createClient();
      const {data,error}=await s.auth.signInWithPassword({email:email.trim().toLowerCase(),password});
      if(error) throw error;
      if(!data.user) throw new Error("Admin account could not be loaded.");
      const {data:profile,error:profileError}=await s.from("profiles").select("role").eq("id",data.user.id).maybeSingle();
      if(profileError) throw profileError;
      if(profile?.role!=="admin"){
        await s.auth.signOut();
        throw new Error("This account is not authorized as an administrator.");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-indigo-600">Malvis Digital Growth</p>
      <h1 className="mt-1 text-2xl font-bold">Admin login</h1>
      <p className="mt-2 text-sm text-slate-500">Authorized administrators only.</p>
      <input required type="email" className="mt-6 w-full rounded-xl border p-3" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username"/>
      <input required type="password" className="mt-3 w-full rounded-xl border p-3" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/>
      {error&&<p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={loading} className="mt-4 w-full rounded-xl bg-black p-3 text-white disabled:opacity-50">{loading?"Signing in...":"Sign in as admin"}</button>
    </form>
  </main>;
}