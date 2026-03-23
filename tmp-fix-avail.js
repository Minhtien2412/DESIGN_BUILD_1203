const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Check enum values
  const enumVals = await p.$queryRawUnsafe(
    "SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'worker_availability' ORDER BY e.enumsortorder",
  );
  console.log("worker_availability enum values:", JSON.stringify(enumVals));

  // Fix column type: text -> worker_availability enum
  // First set default, then alter type
  try {
    await p.$executeRawUnsafe(
      "ALTER TABLE workers ALTER COLUMN availability DROP DEFAULT",
    );
    await p.$executeRawUnsafe(
      "ALTER TABLE workers ALTER COLUMN availability TYPE worker_availability USING availability::worker_availability",
    );
    await p.$executeRawUnsafe(
      "ALTER TABLE workers ALTER COLUMN availability SET DEFAULT 'available'",
    );
    console.log("Column type fixed to worker_availability enum");
  } catch (e) {
    console.error("Fix error:", e.message);
  }

  // Verify
  const cols = await p.$queryRawUnsafe(
    "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'availability'",
  );
  console.log("After fix:", JSON.stringify(cols));

  await p.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
