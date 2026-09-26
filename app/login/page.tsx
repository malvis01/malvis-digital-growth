import Link from "next/link";
import AuthForm from "@/app/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <div className="w-full">
        <h1 className="text-3xl font-bold">Log in</h1>
        <p className="mt-2 text-slate-600">
          Use your Nigerian phone number and password. No OTP.
        </p>
        <AuthForm mode="login" />
        <p className="mt-4 text-sm text-slate-600">Admin?{" "}<Link className="font-semibold text-black underline" href="/admin/login">Open admin login</Link></p>
        <p className="mt-6 text-sm text-slate-600">
          New here?{" "}
          <Link className="font-semibold text-black underline" href="/register">
            Create a business account
          </Link>
        </p>
      </div>
    </main>
  );
}
