import {NextResponse} from "next/server"; import {createClient} from "@/lib/supabase/server";
export async function POST(req:Request){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({error:"Not authenticated"},{status:401});
 const {amount,bankName,accountName,accountNumber}=await req.json();const n=Number(amount);
 if(!Number.isFinite(n)||n<=0)return NextResponse.json({error:"Enter a valid amount."},{status:400});
 if(!bankName||!accountName||!/^[0-9]{10}$/.test(String(accountNumber)))return NextResponse.json({error:"Enter a valid Nigerian 10-digit account number and bank details."},{status:400});
 const {data:sum}=await s.from("commissions").select("amount_ngn").eq("profile_id",user.id).eq("status","paid");
 const balance=(sum||[]).reduce((a,r)=>a+Number(r.amount_ngn),0);
 const {data:out}=await s.from("withdrawals").select("amount_ngn,status").eq("profile_id",user.id).neq("status","rejected");
 const reserved=(out||[]).reduce((a,r)=>a+Number(r.amount_ngn),0);
 const available=balance-reserved;
 if(n>available)return NextResponse.json({error:"Insufficient available commission balance."},{status:400});
 if(n<1000)return NextResponse.json({error:"Minimum withdrawal is ₦1,000."},{status:400});
 const {error}=await s.from("withdrawals").insert({profile_id:user.id,amount_ngn:n,bank_name:bankName.trim(),account_name:accountName.trim(),account_number:String(accountNumber),status:"pending"});
 if(error)return NextResponse.json({error:error.message},{status:400});
 await s.from("notifications").insert({user_id:user.id,title:"Withdrawal request received",message:"Your withdrawal request is pending admin review.",type:"commission"});
 return NextResponse.json({ok:true});
}