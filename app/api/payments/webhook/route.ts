import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret || !signature) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8"))
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const ref = String(event.data?.reference || "");
  const amount = Number(event.data?.amount || 0);
  if (!ref) return NextResponse.json({ received: true });

  const s = createServiceClient();
  const { data: payment } = await s
    .from("payments")
    .select("id,business_id,subscription_id,amount_ngn,status")
    .eq("id", ref)
    .maybeSingle();

  if (!payment) return NextResponse.json({ received: true });
  if (payment.status === "paid") return NextResponse.json({ received: true });

  if (amount !== Math.round(Number(payment.amount_ngn) * 100)) {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  const now = new Date();
  const end = new Date(now.getTime() + 30 * 86400000);

  const { data: markedPaid, error: paymentError } = await s
    .from("payments")
    .update({
      status: "paid",
      paid_at: now.toISOString(),
      provider_reference: ref,
      metadata: event.data,
    })
    .eq("id", payment.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (paymentError) {
    return NextResponse.json({ error: "Unable to record payment" }, { status: 500 });
  }

  // A simultaneous callback/webhook may have completed this payment first.
  // In that case the other request owns the follow-up activation work.
  if (!markedPaid) {
    return NextResponse.json({ received: true });
  }

  const platformFee = Math.round(Number(payment.amount_ngn) * 0.05 * 100) / 100;
  if (platformFee > 0) {
    const { data: existing } = await s
      .from("platform_ledger")
      .select("id")
      .eq("reference_id", payment.id)
      .eq("source", "subscription")
      .maybeSingle();

    if (!existing) {
      await s.from("platform_ledger").insert({
        source: "subscription",
        reference_id: payment.id,
        entry_type: "commission",
        amount_ngn: platformFee,
        status: "available",
        notes: "5% platform commission from subscription payment",
      });
    }
  }

  await s
    .from("subscriptions")
    .update({
      status: "active",
      starts_at: now.toISOString(),
      ends_at: end.toISOString(),
    })
    .eq("id", payment.subscription_id);

  await s.from("invoices").update({ status: "paid" }).eq("payment_id", payment.id);

  const { data: b } = await s
    .from("businesses")
    .select("owner_id")
    .eq("id", payment.business_id)
    .maybeSingle();

  if (b?.owner_id) {
    await s.from("notifications").insert({
      user_id: b.owner_id,
      title: "Payment successful",
      message: "Your subscription payment was confirmed and your plan is active.",
      type: "billing",
    });
  }

  return NextResponse.json({ received: true });
}
