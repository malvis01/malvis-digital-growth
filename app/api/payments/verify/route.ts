import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(req:Request){
 const url=new URL(req.url),ref=url.searchParams.get("reference");
 if(!ref)return NextResponse.json({error:"Missing reference"},{status:400});
 const s=await createClient(),admin=createServiceClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.redirect(new URL("/login",url));

 const {data:payment}=await s.from("payments").select("id,business_id,subscription_id,amount_ngn,status").eq("id",ref).maybeSingle();
 if(!payment)return NextResponse.json({error:"Payment not found"},{status:404});
 const {data:b}=await s.from("businesses").select("id").eq("id",payment.business_id).eq("owner_id",user.id).maybeSingle();
 if(!b)return NextResponse.json({error:"Forbidden"},{status:403});
 if(payment.status==="paid")return NextResponse.redirect(new URL("/dashboard/payments?status=success",url));

 const key=process.env.PAYSTACK_SECRET_KEY;
 if(!key)return NextResponse.json({error:"Provider not configured"},{status:503});
 const res=await fetch("https://api.paystack.co/transaction/verify/"+encodeURIComponent(ref),{headers:{Authorization:"Bearer "+key}});
 const data=await res.json();
 if(!res.ok||!data.status)return NextResponse.redirect(new URL("/dashboard/payments?status=verification_failed",url));

 const paid=data.data?.status==="success"&&Number(data.data?.amount)===Math.round(Number(payment.amount_ngn)*100);
 if(!paid)return NextResponse.redirect(new URL("/dashboard/payments?status=payment_not_successful",url));

 const now=new Date(),end=new Date(now.getTime()+30*86400000);
 const {error:paymentError}=await admin.from("payments").update({
  status:"paid",paid_at:now.toISOString(),provider_reference:data.data.reference,metadata:data.data
 }).eq("id",payment.id).eq("status","pending");
 if(paymentError)return NextResponse.redirect(new URL("/dashboard/payments?status=verification_failed",url));

 await admin.from("subscriptions").update({status:"active",starts_at:now.toISOString(),ends_at:end.toISOString()}).eq("id",payment.subscription_id);
 await admin.from("invoices").update({status:"paid"}).eq("payment_id",payment.id);
 await admin.from("notifications").insert({user_id:user.id,title:"Payment successful",message:"Your subscription has been activated.",type:"billing"});
 return NextResponse.redirect(new URL("/dashboard/payments?status=success",url));
}