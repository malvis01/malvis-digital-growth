const AUTH_EMAIL_DOMAIN = "phone.malvisdigitalgrowth.com";

export function phoneToAuthEmail(normalizedPhone: string) {
  const digits = normalizedPhone.replace(/\D/g, "");
  return `${digits}@${AUTH_EMAIL_DOMAIN}`;
}
