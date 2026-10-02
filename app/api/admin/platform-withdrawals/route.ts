import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

function isAdmin(role:string|undefined){return role==="admin";}
function num(v:any){const n=Number(v);return Number.isFinite(n)?n:0;}

export async function GET(){
 const s=await createClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:"Not authenticated"},{status:401});
 const {data:p}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(!isAdmin(p?.role))return NextResponse.json({error:"Forbidden"},{status:403});

 const [{data:ledger},{data:outs},{data:payments},{data:refCommissions}]=await Promise.all([
  s.from("platform_ledger").select("*").order("created_at",{ascending:false}),
  s.from("platform_withdrawals").select("*").order("created_at",{ascending:false}),
  s.from("payments").select("id,amount_ngn,status,subscription_id,advertisement_id,metadata,paid_at,created_at").eq("status","paid").order("paid_at",{ascending:false}),
  s.from("commissions").select("id,amount_ngn,status,payment_id,created_at").order("created_at",{ascending:false})
 ]);

 const paid=payments||[];
 const gross=paid.reduce((a,x)=>a+num(x.amount_ngn),0);
 const subscriptionGross=paid.filter(x=>x.subscription_id).reduce((a,x)=>a+num(x.amount_ngn),0);
 const advertisingGross=paid.filter(x=>x.advertisement_id).reduce((a,x)=>a+num(x.amount_ngn),0);
 const serviceGross=paid.filter(x=>x.metadata?.payment_kind==="marketing_service").reduce((a,x)=>a+num(x.amount_ngn),0);
 const providerFees=paid.reduce((a,x)=>a+num(x.metadata?.fees),0);
 const platformRevenue=(ledger||[]).filter(x=>x.entry_type==="commission"&&x.status==="available").reduce((a,x)=>a+num(x.amount_ngn),0);
 const referralPending=(refCommissions||[]).filter(x=>x.status!=="paid"&&x.status!=="rejected").reduce((a,x)=>a+num(x.amount_ngn),0);
 const withdrawn=(outs||[]).filter(x=>x.status!=="rejected").reduce((a,x)=>a+num(x.amount_ngn),0);
 const available=Math.max(0,platformRevenue-referralPending-withdrawn);

 return NextResponse.json({
  grossPaid:gross,
  subscriptionGross,
  advertisingGross,
  serviceGross,
  providerFees,
  platformRevenue,
  referralPending,
  withdrawn,
  available,
  paidPayments:paid.length,
  ledger:ledger||[],
  withdrawals:outs||[],
  referralCommissions:refCommissions||[]
 });
}

export async function PATCH(req:Request){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user)return NextResponse.json({error:"Not authenticated"},{status:401}); const {data:p}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle(); if(!isAdmin(p?.role))return NextResponse.json({error:"Forbidden"},{status:403});
 const {id,status,reason}=await req.json(); if(!["processing","paid","rejected"].includes(status))return NextResponse.json({error:"Invalid status"},{status:400});
 const {data:w}=await s.from("platform_withdrawals").select("id,amount_ngn,status,account_name").eq("id",id).maybeSingle(); if(!w)return NextResponse.json({error:"Withdrawal not found."},{status:404}); if(w.status==="paid")return NextResponse.json({error:"Withdrawal is already paid."},{status:409});
 if(status==="rejected"&&!String(reason||"").trim())return NextResponse.json({error:"A rejection reason is required."},{status:400});
 const patch:any={status}; if(status==="paid")patch.processed_at=new Date().toISOString(); if(status==="rejected")patch.rejection_reason=String(reason).trim();
 const {error}=await s.from("platform_withdrawals").update(patch).eq("id",id); if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({ok:true});
}

export async function POST(req:Request){
 const s=await createClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:"Not authenticated"},{status:401});
 const {data:p}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(!isAdmin(p?.role))return NextResponse.json({error:"Forbidden"},{status:403});
 const {amount,bankName,accountName,accountNumber}=await req.json();
 const n=Number(amount);
 if(!Number.isFinite(n)||n<=0||!bankName||!accountName||!/^[0-9]{10}$/.test(String(accountNumber)))return NextResponse.json({error:"Valid amount and Nigerian bank details are required."},{status:400});

 const [{data:ledger},{data:outs},{data:refCommissions}]=await Promise.all([
  s.from("platform_ledger").select("amount_ngn,entry_type,status").eq("status","available"),
  s.from("platform_withdrawals").select("amount_ngn,status").neq("status","rejected"),
  s.from("commissions").select("amount_ngn,status")
 ]);
 const platformRevenue=(ledger||[]).filter(x=>x.entry_type==="commission").reduce((a,x)=>a+num(x.amount_ngn),0);
 const referralPending=(refCommissions||[]).filter(x=>x.status!=="paid"&&x.status!=="rejected").reduce((a,x)=>a+num(x.amount_ngn),0);
 const reserved=(outs||[]).reduce((a,x)=>a+num(x.amount_ngn),0);
 const available=Math.max(0,platformRevenue-referralPending-reserved);
 if(n>available)return NextResponse.json({error:"Insufficient platform revenue balance."},{status:400});

 const {error}=await s.from("platform_withdrawals").insert({amount_ngn:n,bank_name:bankName,account_name:accountName,account_number:String(accountNumber),status:"pending"});
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({ok:true});
}