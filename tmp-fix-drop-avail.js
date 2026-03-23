const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Drop the conflicting text column we added earlier
  try {
    await p.$executeRawUnsafe(
      "ALTER TABLE workers DROP COLUMN IF EXISTS availability",
    );
    console.log("Dropped availability text column");
  } catch (e) {
    console.error("Drop error:", e.message);
  }

  // Verify column is gone
  const cols = await p.$queryRawUnsafe(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'availability'",
  );
  console.log("availability columns remaining:", cols.length);

  // Test insert now
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
    console.log("SUCCESS! Test worker created with id:", test.id);
    // Clean up
    await p.worker.delete({ where: { id: test.id } });
    console.log("Cleaned up test worker");
  } catch (e) {
    console.error("Insert error:", e.message);
  }

  await p.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
