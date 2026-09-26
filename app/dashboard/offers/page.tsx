import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Section from "../_components/Section";
import OfferManager from "./OfferManager";

export default async function Offers(){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect("/login");
 const {data:b}=await s.from("businesses").select("id").eq("owner_id",user.id).limit(1).maybeSingle();
 if(!b)return <main className="p-6">Create a business profile first.</main>;
 const [{data:p},{data:sv}]=await Promise.all([s.from("products").select("id,name,price_ngn,active").eq("business_id",b.id).order("created_at",{ascending:false}),s.from("services").select("id,name,price_ngn,active").eq("business_id",b.id).order("created_at",{ascending:false})]);
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Section title="Products & services" description="Add and manage the offers customers can discover." href="/dashboard"><OfferManager businessId={b.id} initialProducts={p??[]} initialServices={sv??[]}/></Section></div></main>;
}