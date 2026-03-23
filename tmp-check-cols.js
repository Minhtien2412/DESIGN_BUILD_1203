const path = require("path");
const { PrismaClient } = require(
  path.join("/app", "node_modules", "@prisma/client"),
);
const p = new PrismaClient();

(async () => {
  const cols = await p.$queryRawUnsafe(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='workers' ORDER BY ordinal_position`,
  );
  console.log(JSON.stringify(cols, null, 2));

  // Also check worker_reviews table
  const reviewCols = await p.$queryRawUnsafe(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='worker_reviews' ORDER BY ordinal_position`,
  );
  console.log("\n--- worker_reviews columns ---");
  console.log(JSON.stringify(reviewCols, null, 2));

  // Check if worker_reviews table exists and has data
  try {
    const count = await p.$queryRawUnsafe(
      `SELECT COUNT(*) as cnt FROM worker_reviews`,
    );
    console.log("\nworker_reviews count:", count);
  } catch (e) {
    console.log("\nworker_reviews table error:", e.message);
  }

  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
