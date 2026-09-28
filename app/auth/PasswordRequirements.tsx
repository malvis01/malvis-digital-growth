"use client";
import { useMemo } from "react";
export default function PasswordRequirements({password}:{password:string}){
 const checks=useMemo(()=>({length:password.length>=8,lower:/[a-z]/.test(password),upper:/[A-Z]/.test(password),number:/\d/.test(password),symbol:/[^A-Za-z0-9]/.test(password)}),[password]);
 return <div className="mt-2 grid gap-1 text-xs text-slate-500">{Object.entries(checks).map(([k,v])=><div key={k} className={v?"text-emerald-600":"text-slate-400"}>{v?"✓":"○"} {({length:"At least 8 characters",lower:"A lowercase letter",upper:"An uppercase letter",number:"A number",symbol:"A symbol"})[k as keyof typeof checks]}</div>)}</div>;
}