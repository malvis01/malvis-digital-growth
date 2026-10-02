import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: Request) {
  const s = await createClient();
  const admin = createServiceClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const planId = body?.planId;
  const billingEmail = String(body?.billingEmail || "").trim().toLowerCase();
  const { data: b } = await s.from("businesses").select("id,name,email").eq("owner_id", user.id).limit(1).maybeSingle();
  if (!b) return NextResponse.json({ error: "Create your business profile first." }, { status: 400 });

  const { data: plan } = await s.from("plans").select("id,name,slug,price_ngn,billing_interval").eq("id", planId).eq("active", true).maybeSingle();
  if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

  const { data: existing } = await admin.from("subscriptions").select("id,status,ends_at").eq("business_id", b.id).eq("plan_id", plan.id).in("status", ["active","pending"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (existing?.status === "active" && existing.ends_at && new Date(existing.ends_at) > new Date()) {
    return NextResponse.json({ error: "This plan is already active for your business." }, { status: 409 });
  }
  if (existing?.status === "pending") {
    return NextResponse.json({ error: "You already have a pending payment for this plan. Check your Payments page before starting another checkout." }, { status: 409 });
  }

  if (Number(plan.price_ngn) <= 0) {
    const starts = new Date(), ends = new Date(starts.getTime() + 30 * 86400000);
    const { data: freeSub, error } = await admin.from("subscriptions").insert({
      business_id: b.id, plan_id: plan.id, status: "active",
      starts_at: starts.toISOString(), ends_at: ends.toISOString()
    }).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await admin.from("notifications").insert({ user_id: user.id, title: "Free plan activated", message: "Your free plan is now active.", type: "billing" });
    return NextResponse.json({ ok: true, free: true, subscriptionId: freeSub.id });
  }

  const email = billingEmail || String(b.email || user.email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "A valid billing email is required for Paystack checkout." }, { status: 400 });

  const { data: sub, error } = await admin.from("subscriptions").insert({
    business_id: b.id, plan_id: plan.id, status: "pending"
  }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const cleanup = async () => {
    await admin.from("invoices").delete().eq("subscription_id", sub.id);
    await admin.from("payments").delete().eq("subscription_id", sub.id);
    await admin.from("subscriptions").delete().eq("id", sub.id);
  };

  const { data: pay, error: pe } = await admin.from("payments").insert({
    business_id: b.id, subscription_id: sub.id, amount_ngn: plan.price_ngn, status: "pending",
    provider: "paystack", metadata: { plan_slug: plan.slug, billing_email: email }
  }).select("id").single();
  if (pe) {
    await cleanup();
    return NextResponse.json({ error: pe.message }, { status: 400 });
  }

  const ref = "INV-" + Date.now();
  const { error: invoiceError } = await admin.from("invoices").insert({
    business_id: b.id, payment_id: pay.id, invoice_number: ref, amount_ngn: plan.price_ngn, status: "issued"
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
        amount: Math.round(Number(plan.price_ngn) * 100),
        reference: pay.id,
        channels: ["card", "bank", "bank_transfer", "ussd", "payattitude"],
        callback_url: base + "/api/payments/verify"
      })
    });
  } catch {
    await cleanup();
    return NextResponse.json({ error: "Unable to reach the payment provider." }, { status: 502 });
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    await cleanup();
    return NextResponse.json({ error: "Payment provider returned an invalid response." }, { status: 502 });
  }

  if (!res.ok || !data.status || !data.data?.authorization_url) {
    await cleanup();
    return NextResponse.json({ error: data.message || "Unable to initialize payment." }, { status: 502 });
  }

  return NextResponse.json({ authorization_url: data.data.authorization_url, reference: pay.id });
}
