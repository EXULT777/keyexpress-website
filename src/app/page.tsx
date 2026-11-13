import { getBusinessSettings } from "@/server/content";
import { db } from "@/server/db";

export default async function HomePage() {
  const settings = await getBusinessSettings(db);
  return (
    <main>
      <h1>{settings.businessName}</h1>
      <p>{settings.phone}</p>
    </main>
  );
}
