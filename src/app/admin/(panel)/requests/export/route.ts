import { requireAdmin } from "@/server/admin-session";
import { serviceRequestsToCsv } from "@/server/csv";
import { db } from "@/server/db";
import { listServiceRequests } from "@/server/service-requests";

// Every Service Request, newest first, as a file Excel or Google Sheets can open.
export async function GET() {
  await requireAdmin();
  const csv = serviceRequestsToCsv(await listServiceRequests(db));
  const today = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="service-requests-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
