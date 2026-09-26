import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req:Request){
 const s=await createClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:"Not authenticated"},{status:401});

 const body=await req.json();
 const planId=body?.planId;
 const billingEmail=String(body?.billingEmail||"").trim().toLowerCase();
 const {data:b}=await s.from("businesses").select("id,name,email").eq("owner_id",user.id).limit(1).maybeSingle();
 if(!b)return NextResponse.json({error:"Create your business profile first."},{status:400});

 const {data:plan}=await s.from("plans").select("id,name,slug,price_ngn,billing_interval").eq("id",planId).eq("active",true).maybeSingle();
 if(!plan)return NextResponse.json({error:"Plan not found."},{status:404});
 if(Number(plan.price_ngn)<=0)return NextResponse.json({ok:true,free:true});

 const email=billingEmail||String(b.email||user.email||"").trim().toLowerCase();
 if(!/^\S+@\S+\.\S+$/.test(email))return NextResponse.json({error:"A valid billing email is required for Paystack checkout."},{status:400});

 const {data:sub,error}=await s.from("subscriptions").insert({business_id:b.id,plan_id:plan.id,status:"pending"}).select("id").single();
 if(error)return NextResponse.json({error:error.message},{status:400});
 const {data:pay,error:pe}=await s.from("payments").insert({business_id:b.id,subscription_id:sub.id,amount_ngn:plan.price_ngn,status:"pending",provider:"paystack",metadata:{plan_slug:plan.slug,billing_email:email}}).select("id").single();
 if(pe)return NextResponse.json({error:pe.message},{status:400});
 const ref="INV-"+Date.now();
 const {error:invoiceError}=await s.from("invoices").insert({business_id:b.id,payment_id:pay.id,invoice_number:ref,amount_ngn:plan.price_ngn,status:"issued"});
 if(invoiceError)return NextResponse.json({error:invoiceError.message},{status:400});

 const key=process.env.PAYSTACK_SECRET_KEY;
 if(!key)return NextResponse.json({error:"Payment provider is not configured yet."},{status:503});
 const base=process.env.NEXT_PUBLIC_APP_URL||req.headers.get("origin")||"";
 const res=await fetch("https://api.paystack.co/transaction/initialize",{method:"POST",headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({email,amount:Math.round(Number(plan.price_ngn)*100),reference:pay.id,callback_url:base+"/api/payments/verify"})});
 const data=await res.json();
 if(!res.ok||!data.status)return NextResponse.json({error:data.message||"Unable to initialize payment."},{status:502});
 return NextResponse.json({authorization_url:data.data.authorization_url,reference:pay.id});
}