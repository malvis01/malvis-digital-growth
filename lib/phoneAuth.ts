const AUTH_EMAIL_DOMAIN = "malvisdigitalgrowth.com";

/**
 * Malvis uses a phone + password UI without SMS/OTP.
 * Supabase Email Auth is used only as the secure credential/session layer; the user-facing identifier remains the normalized Nigerian phone number.
 * The phone number is also stored in the business profile as the canonical contact identifier.
 */
export function phoneToAuthEmail(normalizedPhone: string) {
  const digits = normalizedPhone.replace(/\D/g, "");
  return `${digits}@${AUTH_EMAIL_DOMAIN}`;
}
