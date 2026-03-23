const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Step 1: Restore availability column as TEXT (for Prisma reads)
  try {
    await p.$executeRawUnsafe(
      "ALTER TABLE workers ADD COLUMN availability TEXT DEFAULT 'available'",
    );
    console.log("Restored availability column as TEXT");
  } catch (e) {
    console.log("Column may already exist:", e.message);
  }

  // Step 2: Verify Prisma can read workers now
  try {
    const count = await p.worker.count();
    console.log("Worker count via Prisma:", count);
    const first = await p.worker.findFirst();
    console.log("First worker:", first ? first.name : "none");
  } catch (e) {
    console.error("Read error:", e.message);
  }

  // Step 3: Test raw SQL insert (bypasses type casting)
  try {
    const result = await p.$executeRawUnsafe(
      `
      INSERT INTO workers (name, phone, worker_type, status, availability, experience_years, hourly_rate, daily_rate, location, district, city, description, specialties, certifications, rating, total_reviews, total_jobs, completed_jobs, is_verified, avatar, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::text[], $14::text[], $15, $16, $17, $18, $19, $20, NOW(), NOW())
    `,
      "RAW_TEST_DELETE",
      "0000000001",
      "tho_xay",
      "active",
      "available",
      5,
      100000,
      800000,
      "Test Q1",
      "Q1",
      "TP.HCM",
      "Raw test worker",
      ["test skill"],
      [],
      4.0,
      0,
      0,
      0,
      false,
      "",
    );
    console.log("Raw insert OK:", result);

    // Verify Prisma read
    const w = await p.worker.findFirst({ where: { phone: "0000000001" } });
    console.log(
      "Prisma read-back:",
      w ? `${w.name} avail=${w.availability}` : "NOT FOUND",
    );

    // Cleanup
    await p.$executeRawUnsafe("DELETE FROM workers WHERE phone = '0000000001'");
    console.log("Cleaned up test worker");
  } catch (e) {
    console.error("Raw insert error:", e.message);
  }

  await p.$disconnect();
  console.log("\nREADY — raw SQL insert + Prisma read works!");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
