const AUTH_EMAIL_DOMAIN = "malvisdigitalgrowth.com";

export function phoneToAuthEmail(normalizedPhone: string) {
  const digits = normalizedPhone.replace(/\D/g, "");
  return `phone+${digits}@${AUTH_EMAIL_DOMAIN}`;
}
