import { dataDir } from "@/server/paths";
import { readUpload } from "@/server/uploads";

export async function GET(_request: Request, { params }: RouteContext<"/uploads/[file]">) {
  const { file } = await params;
  const upload = await readUpload(dataDir(), file);
  if (!upload) return new Response("Not found", { status: 404 });

  const headers: Record<string, string> = {
    "Content-Type": upload.contentType,
    // Every upload gets a new name, so a file never changes once stored.
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  if (upload.contentType === "image/svg+xml") {
    // Even opened on its own, an SVG can't run scripts or load anything.
    headers["Content-Security-Policy"] = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox";
  }
  return new Response(new Uint8Array(upload.data), { headers });
}
