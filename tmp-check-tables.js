const path = require("path");
const { PrismaClient } = require(
  path.join("/app", "node_modules", "@prisma/client"),
);
const p = new PrismaClient();

(async () => {
  const tables = await p.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'worker%' ORDER BY table_name`,
  );
  console.log(
    "Worker tables:",
    tables.map((r) => r.table_name),
  );
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
