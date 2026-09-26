import Link from "next/link";
import AuthForm from "@/app/auth/AuthForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <div className="w-full">
        <h1 className="text-3xl font-bold">Create business account</h1>
        <p className="mt-2 text-slate-600">
          Register with phone number and password. No OTP or SMS is used.
        </p>
        <AuthForm mode="register" />
        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-black underline" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
