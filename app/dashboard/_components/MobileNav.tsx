"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/dashboard", "⌂", "Home"],
  ["/dashboard/business", "◉", "Business"],
  ["/dashboard/media", "▶", "Media"],
  ["/dashboard/leads", "♧", "Leads"],
  ["/dashboard/analytics", "↗", "Stats"],
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map(([href, icon, label]) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-14 flex-col items-center justify-center rounded-xl text-[11px] font-semibold ${active ? "bg-slate-100 text-slate-950" : "text-slate-500"}`}
            >
              <span className="text-lg leading-5">{icon}</span>
              <span className="mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
