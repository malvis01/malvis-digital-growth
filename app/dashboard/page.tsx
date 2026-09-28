import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const cards = [
  ["Business Profile","Manage your public business information.","/dashboard/business"],
  ["Business Videos","Upload short promotional videos for your business.","/dashboard/media"],
  ["Movies & Videos","Watch approved media published on the platform.","/media"],
  ["Products & Services","Add offers customers can discover.","/dashboard/offers"],
  ["Leads","Capture and manage customer enquiries.","/dashboard/leads"],
  ["Campaigns","Plan and track marketing campaigns.","/dashboard/campaigns"],
  ["Advertisements","Create promotional placements.","/dashboard/ads"],
  ["Referrals","Track referral activity and commissions.","/dashboard/referrals"],
  ["Analytics","Understand views, clicks and leads.","/dashboard/analytics"],
  ["Notifications","Keep up with important account activity.","/dashboard/notifications"],
  ["Plans","Manage your growth subscription.","/dashboard/plans"],
  ["Payments","Review payment records.","/dashboard/payments"],
  ["Commissions","Track referral commissions.","/dashboard/commissions"],
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id,name,category,status,city,state")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  const businessId = business?.id ?? "";

  const [{ count: productCount }, { count: serviceCount }, { count: leadCount }, { count: campaignCount }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("business_id", businessId),
      supabase.from("services").select("*", { count: "exact", head: true }).eq("business_id", businessId),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("business_id", businessId),
      supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("business_id", businessId),
    ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <header className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-semibold text-indigo-600">Malvis Digital Growth</p><h1 className="text-2xl font-bold">Business dashboard</h1><p className="text-sm text-slate-500">{business?.name ?? "Finish setting up your business profile."}</p></div>
          <div className="flex gap-2"><Link href="/" className="rounded-lg border px-4 py-2 text-sm">Home</Link><form action="/auth/signout" method="post"><button className="rounded-lg bg-black px-4 py-2 text-sm text-white">Log out</button></form></div>
        </header>
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[["Products",productCount ?? 0],["Services",serviceCount ?? 0],["Leads",leadCount ?? 0],["Campaigns",campaignCount ?? 0]].map(([label,value]) => <div key={String(label)} className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}
        </section>
        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map(([title,description,href]) => <Link key={href} href={href} className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm text-slate-500">{description}</p><span className="mt-4 inline-block text-sm font-semibold text-indigo-600">Open →</span></Link>)}
        </section>
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Growth checklist</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{["Complete your business profile","Add products or services","Create your first campaign","Set up an advertisement","Review your analytics"].map(item => <div key={item} className="rounded-xl border p-3 text-sm">○ {item}</div>)}</div>
        </section>
      </div>
    </main>
  );
}