const AUTH_EMAIL_DOMAIN = "malvisdigitalgrowth.com";

/**
 * Supabase hosted projects require the Phone provider to be enabled for
 * native phone/password auth. Malvis uses a phone + password UI without
 * SMS/OTP, so we keep the phone as the user's identifier in our app and
 * use a deterministic, valid email-shaped Auth identifier internally.
 *
 * The generated address is never shown to the user and is only used by
 * Supabase Auth for password authentication.
 */
export function phoneToAuthEmail(normalizedPhone: string) {
  const digits = normalizedPhone.replace(/\D/g, "");
  return `u${digits}@${AUTH_EMAIL_DOMAIN}`;
}
