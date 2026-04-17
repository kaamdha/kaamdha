export function getPhonePrefix(phone: string | null | undefined): string {
  if (!phone) return "XXX";
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length < 3) return "XXX";
  return digits.slice(0, 3);
}
