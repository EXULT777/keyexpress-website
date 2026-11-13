// The public address, e.g. https://www.keyexpress.com. Read when the server runs
// (not baked in at build time), because the domain is only known at deploy.
export function siteUrl(): string {
  const url = process.env.SITE_URL?.trim() || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}
