const path = require("path");
const { PrismaClient } = require(
  path.join("/app", "node_modules", "@prisma/client"),
);
const p = new PrismaClient();

(async () => {
  // Check worker_type enum values
  const wtypes = await p.$queryRawUnsafe(
    `SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'worker_type' ORDER BY e.enumsortorder`,
  );
  console.log("worker_type enum values:");
  console.log(wtypes.map((r) => r.enumlabel));

  // Check worker_status enum values
  const wstatus = await p.$queryRawUnsafe(
    `SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'worker_status' ORDER BY e.enumsortorder`,
  );
  console.log("\nworker_status enum values:");
  console.log(wstatus.map((r) => r.enumlabel));

  // Check if latitude/longitude columns exist
  const geoCols = await p.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name='workers' AND column_name IN ('latitude','longitude','is_featured','portfolio_images')`,
  );
  console.log(
    "\nGeo/extra columns existing:",
    geoCols.map((r) => r.column_name),
  );

  // Sample one worker row to see actual data shape
  const sample = await p.$queryRawUnsafe(`SELECT * FROM workers LIMIT 1`);
  console.log("\nSample worker keys:", Object.keys(sample[0] || {}));
  console.log(
    "Sample worker:",
    JSON.stringify(
      sample[0],
      (k, v) => (typeof v === "bigint" ? Number(v) : v),
      2,
    ),
  );

  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
