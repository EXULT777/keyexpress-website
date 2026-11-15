// Test helper: does what one server process does when it starts, so tests can
// start several real processes at once against the same data folder.
import { prepareDatabase } from "../database-setup";

const [dataDir, email, password] = process.argv.slice(2);

prepareDatabase({ dataDir, admin: { email, password } }).catch((error) => {
  console.error(error);
  process.exit(1);
});
