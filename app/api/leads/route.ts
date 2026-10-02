import {NextResponse} from "next/server";
import {createServiceClient} from "@/lib/supabase/service";
export const runtime="nodejs";
export async function POST(req:Request){
 const body=await req.json().catch(()=>null);
 const businessId=String(body?.businessId||"").trim(),name=String(body?.name||"").trim(),phone=String(body?.phone||"").trim(),message=String(body?.message||"").trim(),source=String(body?.source||"business_page").trim();
 const normalized=phone.replace(/[\s()-]/g,"");
 const validNigeria=/^(?:0|\+234|234)[789]\d{9}$/.test(normalized);
 if(!businessId||name.length<2||name.length>100||!validNigeria||message.length<3||message.length>2000)return NextResponse.json({error:"Please enter your name, phone number and enquiry."},{status:400});
 const admin=createServiceClient();
 const {data:b}=await admin.from("businesses").select("id,owner_id").eq("id",businessId).eq("status","active").maybeSingle();
 if(!b)return NextResponse.json({error:"Business not found."},{status:404});
 const {error}=await admin.from("leads").insert({business_id:b.id,name,phone,message,status:"new",source});
 if(error)return NextResponse.json({error:"Unable to send enquiry right now."},{status:500});
 await admin.from("notifications").insert({user_id:b.owner_id,title:"New customer enquiry",message:name+" sent a new enquiry to your business.",type:"lead"});
 return NextResponse.json({ok:true});
}
