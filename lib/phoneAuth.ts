const AUTH_EMAIL_DOMAIN = "phone.malvisdigitalgrowth.com";

/**
 * Malvis uses a phone + password UI without SMS/OTP.
 * Supabase Auth still needs an email-shaped identifier internally.
 * The database trigger recognizes the 234XXXXXXXXXX local part and
 * stores the normalized Nigerian phone number in the user's profile.
 */
export function phoneToAuthEmail(normalizedPhone: string) {
  const digits = normalizedPhone.replace(/\D/g, "");
  return `${digits}@${AUTH_EMAIL_DOMAIN}`;
}
