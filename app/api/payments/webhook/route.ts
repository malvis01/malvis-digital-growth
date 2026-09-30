import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: Request) {
  const raw = await req.text(), signature = req.headers.get("x-paystack-signature"), secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  let event:any; try { event=JSON.parse(raw); } catch { return NextResponse.json({error:"Invalid webhook payload"},{status:400}); }
  if(event.event!=="charge.success") return NextResponse.json({received:true});
  const ref=String(event.data?.reference||""), amount=Number(event.data?.amount||0); if(!ref)return NextResponse.json({received:true});
  const s=createServiceClient();
  const {data:payment}=await s.from("payments").select("id,business_id,subscription_id,advertisement_id,amount_ngn,status,metadata").eq("id",ref).maybeSingle();
  if(!payment)return NextResponse.json({received:true}); if(payment.status==="paid")return NextResponse.json({received:true});
  if(amount!==Math.round(Number(payment.amount_ngn)*100))return NextResponse.json({error:"Amount mismatch"},{status:400});
  const now=new Date(),end=new Date(now.getTime()+30*86400000);
  const {data:markedPaid,error:paymentError}=await s.from("payments").update({status:"paid",paid_at:now.toISOString(),provider_reference:ref,metadata:event.data}).eq("id",payment.id).eq("status","pending").select("id").maybeSingle();
  if(paymentError)return NextResponse.json({error:"Unable to record payment"},{status:500}); if(!markedPaid)return NextResponse.json({received:true});

  if(payment.advertisement_id){
    const fee=Math.round(Number(payment.amount_ngn)*0.03*100)/100;
    if(fee>0) await s.from("platform_ledger").upsert({source:"advertisement",reference_id:payment.id,entry_type:"commission",amount_ngn:fee,status:"available",notes:"3% platform commission from paid advertisement budget"},{onConflict:"source,reference_id",ignoreDuplicates:true});
    await s.from("advertisements").update({status:"active",paid_at:now.toISOString(),payment_id:payment.id}).eq("id",payment.advertisement_id).eq("status","pending");
    await s.from("invoices").update({status:"paid"}).eq("payment_id",payment.id);
    const {data:b}=await s.from("businesses").select("owner_id").eq("id",payment.business_id).maybeSingle();
    if(b?.owner_id) await s.from("notifications").insert({user_id:b.owner_id,title:"Advertisement payment successful",message:"Your advertisement budget was paid and the advertisement is now active.",type:"billing"});
    return NextResponse.json({received:true});
  }

  if(payment.subscription_id){
    const fee=Math.round(Number(payment.amount_ngn)*0.05*100)/100;
    if(fee>0) await s.from("platform_ledger").upsert({source:"subscription",reference_id:payment.id,entry_type:"commission",amount_ngn:fee,status:"available",notes:"5% platform commission from subscription payment"},{onConflict:"source,reference_id",ignoreDuplicates:true});
    await s.from("subscriptions").update({status:"active",starts_at:now.toISOString(),ends_at:end.toISOString()}).eq("id",payment.subscription_id);
    await s.from("invoices").update({status:"paid"}).eq("payment_id",payment.id);

    const {data:referral}=await s.from("referrals").select("id,referrer_id,referred_business_id,status").eq("referred_business_id",payment.business_id).maybeSingle();
    if(referral){
      const {data:already}=await s.from("commissions").select("id").eq("referral_id",referral.id).maybeSingle();
      if(!already){
        const referralFee=Math.round(Number(payment.amount_ngn)*0.05*100)/100;
        if(referralFee>0){
          await s.from("commissions").insert({referral_id:referral.id,profile_id:referral.referrer_id,payment_id:payment.id,amount_ngn:referralFee,status:"pending"});
          await s.from("referrals").update({status:"earned"}).eq("id",referral.id);
          await s.from("notifications").insert({user_id:referral.referrer_id,title:"Referral commission earned",message:"You earned a 5% referral commission of ₦"+referralFee.toLocaleString()+" from a qualifying subscription payment.",type:"commission"});
        }
      }
    }
    const {data:b}=await s.from("businesses").select("owner_id").eq("id",payment.business_id).maybeSingle();
    if(b?.owner_id) await s.from("notifications").insert({user_id:b.owner_id,title:"Payment successful",message:"Your subscription payment was confirmed and your plan is active.",type:"billing"});
  }
  return NextResponse.json({received:true});
}