import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const SERVICES: Record<string, { name: string; price: number }> = {
  starter: { name: "Starter Promotion", price: 5000 },
  growth: { name: "Growth Promotion", price: 10000 },
  business: { name: "Business Growth", price: 20000 },
};

export async function POST(req: Request) {
  const s = await createClient();
  const admin = createServiceClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in before purchasing a marketing service." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const service = SERVICES[String(body?.service || "").trim()];
  const billingEmail = String(body?.billingEmail || "").trim().toLowerCase();
  if (!service) return NextResponse.json({ error: "Marketing service not found." }, { status: 404 });

  const { data: b } = await s.from("businesses").select("id,name,email").eq("owner_id", user.id).limit(1).maybeSingle();
  if (!b) return NextResponse.json({ error: "Create your business profile first." }, { status: 400 });

  const email = billingEmail || String(b.email || user.email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "A valid billing email is required for Paystack checkout." }, { status: 400 });
  }

  const { data: pay, error: paymentError } = await admin.from("payments").insert({
    business_id: b.id,
    amount_ngn: service.price,
    status: "pending",
    provider: "paystack",
    metadata: {
      payment_kind: "marketing_service",
      service_slug: Object.entries(SERVICES).find(([, v]) => v.name === service.name)?.[0],
      service_name: service.name,
      billing_email: email,
    },
  }).select("id").single();

  if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 400 });

  const cleanup = async () => {
    await admin.from("invoices").delete().eq("payment_id", pay.id);
    await admin.from("payments").delete().eq("id", pay.id);
  };

  const { error: invoiceError } = await admin.from("invoices").insert({
    business_id: b.id,
    payment_id: pay.id,
    invoice_number: "MKT-" + Date.now(),
    amount_ngn: service.price,
    status: "issued",
  });

  if (invoiceError) {
    await cleanup();
    return NextResponse.json({ error: invoiceError.message }, { status: 400 });
  }

  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    await cleanup();
    return NextResponse.json({ error: "Payment provider is not configured yet." }, { status: 503 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "";
  let res: Response;
  try {
    res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount: Math.round(service.price * 100),
        reference: pay.id,
        channels: ["card", "bank", "bank_transfer", "ussd", "qr", "payattitude"],
        callback_url: base + "/api/payments/verify",
      }),
    });
  } catch {
    await cleanup();
    return NextResponse.json({ error: "Unable to reach the payment provider." }, { status: 502 });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.status || !data?.data?.authorization_url) {
    await cleanup();
    return NextResponse.json({ error: data?.message || "Unable to initialize payment." }, { status: 502 });
  }

  return NextResponse.json({
    authorization_url: data.data.authorization_url,
    reference: pay.id,
    service: service.name,
  });
}
