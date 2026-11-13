import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getBusinessSettings } from "@/server/content";
import { db } from "@/server/db";

// The default picture shown when a page is shared on Facebook, in a text message,
// etc. The Admin can upload a different one per page in the SEO section.
export const dynamic = "force-dynamic";

export async function GET() {
  const [settings, font] = await Promise.all([
    getBusinessSettings(db),
    // The site's font; the image renderer needs it as TTF rather than WOFF2.
    readFile(path.join(process.cwd(), "src/fonts/atkinson-hyperlegible-next-extrabold.ttf")),
  ]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0b2545 0%, #16439e 100%)",
          color: "#ffffff",
          fontFamily: "Atkinson Hyperlegible Next",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <svg width="120" height="120" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="16" fill="#e9edf2" />
            <g fill="none" stroke="#0b2545" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="22" cy="22" r="9" strokeWidth="6" />
              <path d="M28.5 28.5 49 49" strokeWidth="6" />
              <path d="M41 41l5-5M46 46l4-4" strokeWidth="5" />
            </g>
          </svg>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: "2px" }}>{settings.businessName.toUpperCase()}</div>
        </div>
        <div style={{ marginTop: "48px", fontSize: 52, fontWeight: 700 }}>24/7 Mobile Locksmith</div>
        <div style={{ marginTop: "16px", fontSize: 36, color: "#e9edf2" }}>
          {`Cars, homes, and businesses in ${settings.serviceAreaCity} and nearby areas`}
        </div>
        <div style={{ marginTop: "48px", fontSize: 56, fontWeight: 700 }}>{settings.phone}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Atkinson Hyperlegible Next", data: font, weight: 800, style: "normal" }],
      headers: { "Cache-Control": "public, max-age=3600" },
    },
  );
}
