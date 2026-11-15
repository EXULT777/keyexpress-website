import { revalidatePath } from "next/cache";

// Called after every Admin change to what visitors see. Pages already read the
// database on each request; this also refreshes any copy a browser is holding.
export function refreshPublicSite() {
  revalidatePath("/", "layout");
}
