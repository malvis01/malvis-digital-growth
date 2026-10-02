import {NextResponse} from "next/server";
import {createServiceClient} from "@/lib/supabase/service";
export const runtime="nodejs";
export async function POST(req:Request){
 const body=await req.json().catch(()=>null);
 const businessId=String(body?.businessId||"").trim(),name=String(body?.name||"").trim(),phone=String(body?.phone||"").trim(),message=String(body?.message||"").trim();
 if(!businessId||name.length<2||phone.length<7||message.length<3)return NextResponse.json({error:"Please enter your name, phone number and enquiry."},{status:400});
 const admin=createServiceClient();
 const {data:b}=await admin.from("businesses").select("id,owner_id").eq("id",businessId).eq("status","active").maybeSingle();
 if(!b)return NextResponse.json({error:"Business not found."},{status:404});
 const {error}=await admin.from("leads").insert({business_id:b.id,name,phone,message,status:"new"});
 if(error)return NextResponse.json({error:"Unable to send enquiry right now."},{status:500});
 await admin.from("notifications").insert({user_id:b.owner_id,title:"New customer enquiry",message:name+" sent a new enquiry to your business.",type:"lead"});
 return NextResponse.json({ok:true});
}
