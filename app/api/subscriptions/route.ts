import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser();
 if(!user) return NextResponse.json({error:"Not authenticated"},{status:401});
 const {planId}=await req.json();
 const {data:b}=await s.from("businesses").select("id,name").eq("owner_id",user.id).limit(1).maybeSingle();
 if(!b) return NextResponse.json({error:"Create your business profile first."},{status:400});
 const {data:plan}=await s.from("plans").select("id,name,slug,price_ngn,billing_interval").eq("id",planId).eq("active",true).maybeSingle();
 if(!plan) return NextResponse.json({error:"Plan not found."},{status:404});
 const {data:sub,error:subErr}=await s.from("subscriptions").insert({business_id:b.id,plan_id:plan.id,status:plan.price_ngn===0?"active":"pending",starts_at:plan.price_ngn===0?new Date().toISOString():null,ends_at:plan.price_ngn===0?new Date(Date.now()+30*86400000).toISOString():null}).select("id").single();
 if(subErr) return NextResponse.json({error:subErr.message},{status:400});
 if(Number(plan.price_ngn)>0){
  const {data:pay,error:payErr}=await s.from("payments").insert({business_id:b.id,subscription_id:sub.id,amount_ngn:plan.price_ngn,status:"pending",metadata:{plan_slug:plan.slug}}).select("id").single();
  if(payErr) return NextResponse.json({error:payErr.message},{status:400});
  await s.from("invoices").insert({business_id:b.id,payment_id:pay.id,invoice_number:"INV-"+Date.now(),amount_ngn:plan.price_ngn,status:"issued"});
  await s.from("notifications").insert({user_id:user.id,title:"Payment required",message:"Your "+plan.name+" subscription is pending payment. Connect a supported payment provider to complete checkout.",type:"billing"});
 } else {
  await s.from("notifications").insert({user_id:user.id,title:"Plan activated",message:"Your Starter plan is now active for 30 days.",type:"billing"});
 }
 return NextResponse.json({ok:true,requiresPayment:Number(plan.price_ngn)>0});
}