import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function BusinessesPage() {
  const s = await createClient();
  const { data: businesses } = await s.from("businesses")
    .select("id,name,slug,description,category,city,state,logo_url")
    .eq("status","active")
    .order("created_at",{ascending:false})
    .limit(100);

  return <main className="min-h-screen bg-slate-50">
    <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
      <Link href="/" className="font-bold text-slate-950">Malvis Digital Growth</Link>
      <div className="flex gap-2"><Link href="/login" className="rounded-xl border px-4 py-2 text-sm font-semibold">Log in</Link><Link href="/register" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">List your business</Link></div>
    </div></header>
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Business directory</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Discover businesses on Malvis</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Explore businesses, products and services shared by owners on the platform.</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(businesses||[]).map((b:any)=><Link key={b.id} href={"/businesses/"+b.slug} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-4">
            {b.logo_url ? <img src={b.logo_url} alt="" className="h-14 w-14 rounded-2xl object-cover"/> : <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-white">{b.name?.charAt(0)?.toUpperCase()||"B"}</div>}
            <div><h2 className="font-bold text-slate-950">{b.name}</h2><p className="text-sm text-indigo-600">{b.category||"Business"}</p></div>
          </div>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{b.description||"Discover this business and its current offers."}</p>
          <p className="mt-4 text-xs font-semibold text-slate-400">{[b.city,b.state].filter(Boolean).join(", ")||"Online business"}</p>
          <span className="mt-5 inline-flex text-sm font-bold text-slate-950">View business →</span>
        </Link>)}
      </div>
      {!businesses?.length && <div className="mt-10 rounded-2xl border bg-white p-8 text-center text-slate-500">No businesses have been published yet. Be one of the first to list yours.</div>}
    </section>
  </main>;
}
