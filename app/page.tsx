import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const features = [
  { icon: "▦", title: "Business Profile", text: "Give customers one professional place to discover your business, products, services, contact details and offers." },
  { icon: "↗", title: "Marketing Campaigns", text: "Plan and organize campaigns designed to put your business, products and offers in front of the right audience." },
  { icon: "◎", title: "Lead Management", text: "Capture interested customers, keep track of opportunities and turn conversations into follow-up actions." },
  { icon: "▣", title: "Advertising", text: "Create promotional opportunities for your business and keep your marketing activity organized in one dashboard." },
  { icon: "⌁", title: "Growth Analytics", text: "Monitor activity and use clear business insights to understand what is working and where to focus next." },
  { icon: "◇", title: "Offers & Referrals", text: "Create offers and referral opportunities that help customers engage with your business and bring new prospects." },
];

const steps = [
  ["01", "Create your account", "Register your business and set up the basic information customers need to find you."],
  ["02", "Build your presence", "Add your profile, products, services, offers and other information that represents your business."],
  ["03", "Promote and connect", "Use campaigns, advertising and lead tools to reach people and manage new opportunities."],
  ["04", "Measure your growth", "Review activity, leads and performance so you can make better marketing decisions."],
];

const faqs = [
  ["Who is Malvis Digital Growth for?", "It is designed for businesses, entrepreneurs and teams that want a structured way to build their online presence and manage digital marketing activity."],
  ["Do I need a website to use it?", "No. You can create a business presence inside the platform and use the tools available in your account to organize your growth activities."],
  ["Can I promote products and services?", "Yes. Your business profile can present products and services, while campaigns, offers and advertising tools help you promote them."],
  ["Can I track potential customers?", "Yes. The platform includes lead-management features so you can keep interested prospects organized and follow up with them."],
];

async function getPublicVideos() {
  const s = await createClient();
  const { data: items } = await s
    .from("media_items")
    .select("id,title,description,category,media_kind,source_url,storage_path,poster_url")
    .eq("status", "approved")
    .in("media_kind", ["video", "business_promotion"])
    .order("published_at", { ascending: false })
    .limit(12);

  return Promise.all((items || []).map(async (m: any) => {
    let videoUrl: string | null = null;
    if (!m.source_url && m.storage_path) {
      const { data } = await s.storage.from("media").createSignedUrl(m.storage_path, 3600);
      videoUrl = data?.signedUrl || null;
    }
    return { ...m, videoUrl };
  }));
}

export default async function Home() {
  const publicVideos = await getPublicVideos();
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm text-white">M</span>
            <span>Malvis Digital Growth</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-slate-950">Features</a>
            <a href="#how-it-works" className="transition hover:text-slate-950">How it works</a>
            <a href="/businesses" className="transition hover:text-slate-950">Businesses</a><a href="#businesses" className="transition hover:text-slate-950">For businesses</a>
            <a href="#faq" className="transition hover:text-slate-950">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Log in</Link><Link href="/admin/login" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 sm:inline-flex">Admin</Link>
            <Link href="/register" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">Get started</Link>
          </div>
        </div>
      </header>

      <section className="relative border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:py-28">
          <div>
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">Digital marketing & business growth platform</span>
            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Put your business online. <span className="text-slate-500">Turn attention into growth.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Malvis Digital Growth brings your business presence, products, services, campaigns, advertising, leads and growth insights together in one simple platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="rounded-2xl bg-slate-950 px-6 py-3.5 text-center font-bold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800">Create your business account</Link><Link href="/services/marketing" className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-center font-bold text-slate-900 hover:bg-slate-50">Get marketing help</Link><Link href="/businesses" className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-center font-bold text-slate-900 hover:bg-slate-50">Discover businesses</Link><Link href="/media" className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-center font-bold text-slate-900 hover:bg-slate-50">Watch Movies & Videos</Link>
              <Link href="/login" className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-center font-bold text-slate-900 hover:bg-slate-50">Log in to dashboard</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <span>✓ Business profile</span><span>✓ Marketing tools</span><span>✓ Lead management</span><span>✓ Growth insights</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-2xl shadow-slate-900/10">
              <div className="rounded-2xl bg-white p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Business dashboard</p><p className="mt-1 font-bold text-slate-950">Your growth overview</p></div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Live view</span>
                </div>
                <div className="grid grid-cols-2 gap-3 py-5 sm:grid-cols-4">
                  {["Profile", "Leads", "Campaigns", "Offers"].map((item, i) => <div key={item} className="rounded-2xl bg-slate-50 p-4"><div className="text-2xl font-black text-slate-950">{["01","24","08","12"][i]}</div><div className="mt-1 text-xs text-slate-500">{item}</div></div>)}
                </div>
                <div className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between"><span className="text-sm font-semibold">Growth activity</span><span className="text-xs text-slate-400">Recent</span></div>
                  <div className="mt-5 flex h-28 items-end gap-2">{[34,52,43,70,58,82,68,94,78,100].map((h,i)=><div key={i} className="flex-1 rounded-t-md bg-slate-900/85" style={{height:`${h}%`}} />)}</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block"><p className="text-xs text-slate-500">Everything connected</p><p className="mt-1 font-bold text-slate-950">One place to grow</p></div>
          </div>
        </div>
      </section>

      {publicVideos.length > 0 && (
        <section id="videos" className="border-b border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Public videos</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">See what businesses are sharing</h2>
                <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">Approved business and platform videos are available to everyone on the platform — no login required.</p>
              </div>
              <Link href="/media" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-900 hover:bg-slate-100">View all videos</Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {publicVideos.map((m: any) => (
                <article key={m.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  {m.videoUrl ? (
                    <div className="aspect-video bg-black">
                      <video src={m.videoUrl} controls preload="metadata" playsInline className="h-full w-full object-contain" />
                    </div>
                  ) : m.source_url ? (
                    <div className="aspect-video bg-slate-100">
                      <div className="flex h-full items-center justify-center p-6 text-center">
                        <Link href={`/media/${m.id}`} className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Watch video</Link>
                      </div>
                    </div>
                  ) : m.poster_url ? (
                    <img src={m.poster_url} alt="" className="aspect-video w-full object-cover" />
                  ) : null}
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase text-indigo-600">{m.category || "Business video"}</p>
                    <h3 className="mt-2 text-lg font-bold text-slate-950">{m.title}</h3>
                    {m.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{m.description}</p>}
                    <Link href={`/media/${m.id}`} className="mt-4 inline-flex text-sm font-bold text-slate-900 underline underline-offset-4">Open video page →</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Built for practical business growth</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">More than a business profile</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">Your online presence should do more than display your name. It should help you promote what you offer, manage opportunities and understand your marketing activity.</p>
        </div>
      </section>

      <section id="features" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Platform features</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">The tools you need to keep growing</h2><p className="mt-4 text-lg leading-8 text-slate-600">Manage the important parts of your digital growth journey without spreading your work across disconnected tools.</p></div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f)=><article key={f.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white">{f.icon}</div><h3 className="mt-5 text-xl font-bold text-slate-950">{f.title}</h3><p className="mt-3 leading-7 text-slate-600">{f.text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">How it works</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Start simple. Build from there.</h2><p className="mt-5 leading-8 text-slate-600">Set up your presence first, then use the platform's marketing and growth tools as your business needs them.</p><Link href="/register" className="mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800">Start your account</Link></div>
            <div className="grid gap-4 sm:grid-cols-2">{steps.map(([n,t,d])=><article key={n} className="rounded-3xl border border-slate-200 p-6"><span className="text-sm font-black text-slate-400">{n}</span><h3 className="mt-5 text-lg font-bold text-slate-950">{t}</h3><p className="mt-2 leading-7 text-slate-600">{d}</p></article>)}</div>
          </div>
        </div>
      </section>

      <section id="businesses" className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">For businesses</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Build a stronger digital presence around what you actually sell.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">Whether you are promoting products, services or a growing brand, your business gets a central place to present itself and manage marketing activity.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">{["Showcase products & services","Capture and manage leads","Run marketing campaigns","Promote offers and ads","Review growth activity","Manage referrals and commissions"].map(x=><div key={x} className="rounded-2xl border border-white/10 bg-white/5 p-4 font-semibold">{x}</div>)}</div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Ready when you are</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Give your business a better place to grow.</h2><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Create your account, build your business presence and start organizing your digital marketing activity.</p></div>
              <div className="flex flex-col gap-3 sm:flex-row"><Link href="/register" className="rounded-2xl bg-slate-950 px-7 py-4 text-center font-bold text-white hover:bg-slate-800">Create business account</Link><Link href="/services/marketing" className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center font-bold text-slate-900 hover:bg-slate-100">Get marketing help</Link></div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8"><p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-500">FAQ</p><h2 className="mt-3 text-center text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Questions, answered</h2><div className="mt-10 space-y-3">{faqs.map(([q,a])=><details key={q} className="group rounded-2xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer list-none pr-6 font-bold text-slate-950">{q}</summary><p className="mt-3 max-w-3xl leading-7 text-slate-600">{a}</p></details>)}</div></div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div><p className="font-bold text-slate-950">Malvis Digital Growth</p><p className="mt-1 text-sm text-slate-500">Digital marketing and business growth platform.</p></div>
          <div className="flex flex-wrap gap-5 text-sm font-semibold text-slate-600"><a href="#features" className="hover:text-slate-950">Features</a><a href="#how-it-works" className="hover:text-slate-950">How it works</a><Link href="/businesses" className="hover:text-slate-950">Businesses</Link><Link href="/login" className="hover:text-slate-950">Login</Link><Link href="/admin/login" className="hover:text-slate-950">Admin</Link><Link href="/services/marketing" className="hover:text-slate-950">Marketing services</Link><Link href="/register" className="hover:text-slate-950">Register</Link></div>
        </div>
      </footer>
    </main>
  );
}
