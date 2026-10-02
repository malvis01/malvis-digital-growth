const AUTH_EMAIL_DOMAIN = "phone.malvisdigitalgrowth.com";

/**
 * Malvis uses a phone + password UI without SMS/OTP.
 * Supabase Auth still needs an email-shaped identifier internally.
 * The domain must match the database trigger so new accounts also get
 * their phone number stored correctly in profiles.
 */
export function phoneToAuthEmail(normalizedPhone: string) {
  const digits = normalizedPhone.replace(/\D/g, "");
  return `u${digits}@${AUTH_EMAIL_DOMAIN}`;
}
