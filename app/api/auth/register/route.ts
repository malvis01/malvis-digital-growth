import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeNigeriaPhone } from "@/lib/phone";
import { phoneToAuthEmail } from "@/lib/phoneAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let admin: ReturnType<typeof createClient> | null = null;
  let createdUserId: string | null = null;
  let profileCreated = false;

  try {
    const body = await request.json();
    const normalizedPhone = normalizeNigeriaPhone(String(body.phone ?? ""));
    const password = String(body.password ?? "");
    const businessName = String(body.businessName ?? "").trim();

    if (!businessName) {
      return NextResponse.json({ error: "Enter your business name." }, { status: 400 });
    }

    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include uppercase, lowercase, number and symbol." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Account registration is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY to the Netlify environment variables." },
        { status: 503 }
      );
    }

    admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authEmail = phoneToAuthEmail(normalizedPhone);
    const { data: existing, error: lookupError } = await admin
      .from("profiles")
      .select("id")
      .eq("phone", normalizedPhone)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: "We could not check this phone number right now. Please try again." }, { status: 503 });
    }
    if (existing) {
      return NextResponse.json(
        { error: "A business account already exists for this phone number. Please log in." },
        { status: 409 }
      );
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: { phone: normalizedPhone, business_name: businessName },
    });

    if (error) {
      if (/already.*registered|already.*exists|duplicate/i.test(error.message)) {
        return NextResponse.json(
          { error: "An account already exists for this phone number. Please log in." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: "Account could not be created." }, { status: 500 });
    }
    createdUserId = data.user.id;

    const referralCode = "MALVIS" + data.user.id.replace(/-/g, "").slice(0, 8).toUpperCase();
    const { error: profileError } = await admin.from("profiles").insert({
      id: data.user.id,
      phone: normalizedPhone,
      full_name: businessName,
      role: "business_owner",
      referral_code: referralCode,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(data.user.id);
      createdUserId = null;
      return NextResponse.json(
        { error: "Your account profile could not be created. No account was left half-registered; please try again." },
        { status: 500 }
      );
    }
    profileCreated = true;

    const baseSlug = businessName
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "business";
    const slug = baseSlug + "-" + data.user.id.replace(/-/g, "").slice(0, 6).toLowerCase();

    const { error: businessError } = await admin.from("businesses").insert({
      owner_id: data.user.id,
      name: businessName,
      slug,
      phone: normalizedPhone,
      state: "Bayelsa",
      status: "active",
    });

    if (businessError) {
      await admin.from("profiles").delete().eq("id", data.user.id);
      profileCreated = false;
      await admin.auth.admin.deleteUser(data.user.id);
      createdUserId = null;
      return NextResponse.json(
        { error: "Your business profile could not be created, so registration was safely rolled back. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (admin && createdUserId) {
      if (profileCreated) await admin.from("profiles").delete().eq("id", createdUserId);
      await admin.from("businesses").delete().eq("owner_id", createdUserId);
      await admin.auth.admin.deleteUser(createdUserId);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create account." },
      { status: 400 }
    );
  }
}
