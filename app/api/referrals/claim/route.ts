import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(req: Request) {
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user)return NextResponse.json({error:"Not authenticated"},{status:401});
 const body=await req.json().catch(()=>null); const code=String(body?.referralCode||"").trim().toUpperCase(); if(!/^MDG-[A-Z0-9]{8}$/.test(code))return NextResponse.json({error:"Enter a valid referral code."},{status:400});
 const {data:business}=await s.from("businesses").select("id").eq("owner_id",user.id).limit(1).maybeSingle(); if(!business)return NextResponse.json({error:"Create your business profile first."},{status:400});
 const {data:referrer}=await s.from("profiles").select("id").eq("referral_code",code).maybeSingle(); if(!referrer)return NextResponse.json({error:"Referral code not found."},{status:404}); if(referrer.id===user.id)return NextResponse.json({error:"You cannot use your own referral code."},{status:400});
 const {data:existing}=await s.from("referrals").select("id").eq("referred_business_id",business.id).maybeSingle(); if(existing)return NextResponse.json({error:"This business already has a referral attached."},{status:409});
 const {error}=await s.from("referrals").insert({referrer_id:referrer.id,referral_code:code,referred_business_id:business.id,status:"qualified"}); if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json({ok:true});
}
