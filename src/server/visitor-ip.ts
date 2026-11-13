// The visitor's IP address, for rate limiting. On the hosting, Apache passes
// requests on to the app and appends the address it saw to X-Forwarded-For, so
// the last entry is the trustworthy one (earlier entries can be typed in by anyone).
export function visitorIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  const last = forwarded?.split(",").map((part) => part.trim()).filter(Boolean).at(-1);
  return last || headers.get("x-real-ip")?.trim() || null;
}
