import type { Metadata } from "next";
import "./globals.css";

// Every page is rendered when it's requested, from the server's database. Nothing
// is baked in at build time: the build machine's database is not the live one,
// and the Admin's changes must show up as soon as they're saved.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Key Express",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
