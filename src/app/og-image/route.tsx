import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getBusinessSettings } from "@/server/content";
import { db } from "@/server/db";

// The default picture shown when a page is shared on Facebook, in a text message,
// etc. The Admin can upload a different one per page in the SEO section.
export const dynamic = "force-dynamic";

export async function GET() {
  const [settings, font, titleFont, logoFile] = await Promise.all([
    getBusinessSettings(db),
    // The site's fonts; the image renderer needs them as TTF rather than WOFF2.
    readFile(path.join(process.cwd(), "src/fonts/atkinson-hyperlegible-next-extrabold.ttf")),
    readFile(path.join(process.cwd(), "src/fonts/saira-expanded-extrabold-italic.ttf")),
    readFile(path.join(process.cwd(), "public/logo.png")),
  ]);
  const logo = `data:image/png;base64,${logoFile.toString("base64")}`;
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
          background: "radial-gradient(circle at 85% 10%, #5c7aea 0%, #14279b 38%, #0b1650 75%)",
          color: "#ffffff",
          fontFamily: "Atkinson Hyperlegible Next",
        }}
      >
        {/* The default logo, made for dark backgrounds (583×168). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="" width={521} height={150} />
        <div style={{ marginTop: "48px", fontSize: 48, fontFamily: "Saira Expanded", fontStyle: "italic", fontWeight: 800 }}>
          24/7 Mobile Locksmith
        </div>
        <div style={{ marginTop: "16px", fontSize: 36, color: "#e6ecf4" }}>
          {`Cars, homes, and businesses in ${settings.serviceAreaCity} and nearby areas`}
        </div>
        <div style={{ marginTop: "48px", fontSize: 56, fontWeight: 700 }}>{settings.phone}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Atkinson Hyperlegible Next", data: font, weight: 800, style: "normal" },
        { name: "Saira Expanded", data: titleFont, weight: 800, style: "italic" },
      ],
      headers: { "Cache-Control": "public, max-age=3600" },
    },
  );
}
