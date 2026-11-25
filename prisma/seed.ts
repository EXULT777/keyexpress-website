// `npx prisma db seed` (or `npm run db:seed`): fills an empty database with the
// starter content (Business Settings, page text, the 12 Services, the 5 FAQs, the
// Privacy Policy and SEO) and creates the Admin from ADMIN_EMAIL/ADMIN_PASSWORD.
//
// The server does the same thing every time it starts (src/instrumentation.ts),
// so this is only needed to prepare a database without starting the site. It
// never overwrites anything: content is only added to a database that has none,
// and the Admin only if there isn't one yet.
import "dotenv/config";
import { prepareDatabase } from "../src/server/database-setup";
import { dataDir } from "../src/server/paths";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) console.warn("ADMIN_EMAIL or ADMIN_PASSWORD isn't set, so no Admin was created.");

  await prepareDatabase({ dataDir: dataDir(), admin: email && password ? { email, password } : null });
  console.log(`Database ready in ${dataDir()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
