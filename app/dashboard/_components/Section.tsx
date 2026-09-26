import Link from "next/link";
export default function Section({title,description,href,children}:{title:string;description:string;href?:string;children:React.ReactNode}) {
  return <section className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-xl font-bold">{title}</h1><p className="text-sm text-slate-500">{description}</p></div>{href && <Link href={href} className="rounded-lg border px-3 py-2 text-sm">Back to dashboard</Link>}</div><div className="mt-5">{children}</div></section>;
}