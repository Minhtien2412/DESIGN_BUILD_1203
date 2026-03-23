const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Check type info
  const typeInfo = await p.$queryRawUnsafe(
    "SELECT t.typname, t.typtype, t.typlen FROM pg_type t WHERE t.typname = 'worker_availability'",
  );
  console.log("type info:", JSON.stringify(typeInfo));
  // typtype: 'c' = composite, 'e' = enum, 'b' = base, 'r' = range

  // If it's a composite, check its attributes
  const attrs = await p.$queryRawUnsafe(
    "SELECT attname, format_type(atttypid,atttypmod) as type FROM pg_attribute WHERE attrelid = (SELECT oid FROM pg_class WHERE relname = 'worker_availability') AND attnum > 0",
  );
  console.log("composite attrs:", JSON.stringify(attrs));

  // Also try: just skip availability in createMany and see if default works
  // Test a simple insert without availability
  try {
    const test = await p.worker.create({
      data: {
        name: "TEST_DELETE_ME",
        phone: "0000000000",
        workerType: "tho_xay",
        status: "active",
        experienceYears: 1,
        dailyRate: 500000,
        hourlyRate: 70000,
        location: "Test",
        district: "Test",
        city: "Test",
        description: "Test worker - delete me",
        specialties: ["test"],
        certifications: [],
        rating: 4.0,
        totalReviews: 0,
        totalJobs: 0,
        completedJobs: 0,
        isVerified: false,
      },
    });
    console.log("Test insert WITHOUT availability succeeded, id:", test.id);
    // Clean up
    await p.worker.delete({ where: { id: test.id } });
    console.log("Cleaned up test worker");
  } catch (e) {
    console.error("Test insert error:", e.message);
  }

  await p.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
