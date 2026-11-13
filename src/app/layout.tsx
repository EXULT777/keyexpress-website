import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteUrl } from "@/server/site-url";
import "./globals.css";

// Atkinson Hyperlegible Next (SIL Open Font License, src/fonts/OFL.txt), made by
// the Braille Institute for low-vision readers: letters and digits that are hard
// to mix up, which matters on a site built around a phone number. Served from
// this site; the Arial fallback is sized to match so text doesn't jump when the
// font arrives.
const atkinson = localFont({
  src: "../fonts/atkinson-hyperlegible-next-latin.woff2",
  weight: "200 800",
  variable: "--font-atkinson",
  display: "swap",
  adjustFontFallback: "Arial",
});

// Every page is rendered when it's requested, from the server's database. Nothing
// is baked in at build time: the build machine's database is not the live one,
// and the Admin's changes must show up as soon as they're saved.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { metadataBase: new URL(siteUrl()) };
}

export const viewport: Viewport = {
  themeColor: "#0b2545",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={atkinson.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
