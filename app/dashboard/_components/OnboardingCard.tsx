import Link from "next/link";

type Step = {
  label: string;
  done: boolean;
  href: string;
  action: string;
};

export default function OnboardingCard({ steps }: { steps: Step[] }) {
  const completed = steps.filter((step) => step.done).length;
  const progress = Math.round((completed / steps.length) * 100);
  const next = steps.find((step) => !step.done);

  return (
    <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="bg-slate-900 p-5 text-white sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-300">Welcome to Malvis Digital Growth 👋</p>
            <h2 className="mt-1 text-xl font-bold">Let’s get your business ready for customers</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Complete these quick steps so customers can discover your business and what you offer.
            </p>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <p className="text-2xl font-bold">{progress}%</p>
            <p className="text-xs text-slate-300">{completed} of {steps.length} complete</p>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: \`\${progress}%\` }} />
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {steps.map((step, index) => (
            <Link
              key={step.label}
              href={step.href}
              className={`flex items-start gap-3 rounded-xl border p-4 transition hover:shadow-sm \${step.done ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-white"}`}
            >
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold \${step.done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                {step.done ? "✓" : index + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-slate-900">{step.label}</span>
                <span className="mt-1 block text-xs text-slate-500">
                  {step.done ? "Completed — you can update it anytime." : step.action}
                </span>
              </span>
            </Link>
          ))}
        </div>

        {next ? (
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-950">Your next step</p>
              <p className="text-sm text-indigo-800">{next.label}</p>
            </div>
            <Link href={next.href} className="inline-flex justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
              {next.action}
            </Link>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-semibold text-emerald-900">🎉 Your business is ready!</p>
            <p className="mt-1 text-sm text-emerald-800">
              Keep adding products, services and promotional content to grow your visibility.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
