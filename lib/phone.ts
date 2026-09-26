export function normalizeNigeriaPhone(input: string) {
  const value = input.trim().replace(/[\s()-]/g, "");

  if (value.startsWith("+234")) {
    const local = value.slice(4);
    if (/^\d{10}$/.test(local)) return `+234${local}`;
  }

  if (value.startsWith("234") && /^234\d{10}$/.test(value)) {
    return `+${value}`;
  }

  if (value.startsWith("0") && /^0\d{10}$/.test(value)) {
    return `+234${value.slice(1)}`;
  }

  throw new Error("Enter a valid Nigerian phone number, e.g. +2348012345678.");
}