// "(555) 014-7823" -> "tel:+15550147823". US numbers get the +1 country code so
// phones dial them correctly from anywhere.
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`;
  return `tel:${digits}`;
}

// A US number with its area code (10 digits, or 11 starting with 1), or an
// international one written with a leading +.
export function isFullPhoneNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+")) return digits.length >= 8 && digits.length <= 15;
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}
