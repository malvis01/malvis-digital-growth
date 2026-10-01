import Link from "next/link";

const packages = [
  {
    name: "Starter Promotion",
    price: "₦5,000",
    points: ["Business profile review", "Campaign setup", "One promotional offer", "7-day growth plan"],
  },
  {
    name: "Growth Promotion",
    price: "₦10,000",
    points: ["Profile optimization", "Campaign setup", "Promotional video guidance", "14-day promotion plan", "Basic performance review"],
  },
  {
    name: "Business Growth",
    price: "₦20,000+",
    points: ["Campaign management", "Multiple promotional activities", "Content and offer guidance", "Performance reporting", "Ongoing growth support"],
  },
];

export default function MarketingServicesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href="/" className="font-bold text-slate-950">Malvis Digital Growth</Link>
          <div className="flex gap-2">
            <Link href="/login" className="rounded-xl border px-4 py-2 text-sm font-semibold">Log in</Link>
            <Link href="/register" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Get started</Link>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Done-for-you marketing</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Need help promoting your business?</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Malvis Digital Growth provides practical marketing support for businesses that want help setting up campaigns, offers and promotional activities. The packages below are service options; advertising spend is separate where applicable.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {packages.map((p) => (
            <article key={p.name} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">{p.name}</h2>
              <p className="mt-4 text-3xl font-black text-slate-950">{p.price}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {p.points.map((x) => <li key={x}>✓ {x}</li>)}
              </ul>
              <a href="mailto:malvisdabz@gmail.com?subject=Malvis%20Marketing%20Service" className="mt-7 block rounded-xl bg-slate-950 px-4 py-3 text-center font-bold text-white hover:bg-slate-800">
                Request this service
              </a>
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-3xl border border-indigo-100 bg-indigo-50 p-6">
          <h2 className="font-bold text-slate-950">Important</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A campaign budget is separate from a Malvis service fee. We will show customers the difference clearly so they know what they are paying for.
          </p>
        </div>
      </section>
    </main>
  );
}
