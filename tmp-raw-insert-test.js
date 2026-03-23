const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Check what types exist with 'worker_availability'
  const types = await p.$queryRawUnsafe(
    "SELECT t.typname, t.typtype FROM pg_type t WHERE t.typname LIKE '%worker_availability%'",
  );
  console.log("Types:", JSON.stringify(types));

  // Check if there's a table called worker_availability
  const tables = await p.$queryRawUnsafe(
    "SELECT table_name FROM information_schema.tables WHERE table_name = 'worker_availability'",
  );
  console.log("Table exists:", tables.length > 0);

  // Check generated Prisma SQL for creating a worker
  // by inspecting the DMMF
  try {
    // Test: use raw SQL to insert, bypassing Prisma's type handling
    // First, check if we can create the enum under a different name
    // Actually, let's check what Prisma's compiled migration SQL looks like
    const migrations = await p.$queryRawUnsafe(
      "SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 10",
    );
    console.log("Recent migrations:", JSON.stringify(migrations));
  } catch (e) {
    console.log("No migrations table or error:", e.message);
  }

  // Option: Raw SQL insert that skips the availability column entirely
  // Prisma adds it to SELECT but not necessarily to INSERT
  try {
    const result = await p.$executeRawUnsafe(`
      INSERT INTO workers (name, phone, worker_type, status, experience_years, hourly_rate, daily_rate, location, district, city, description, specialties, certifications, rating, total_reviews, total_jobs, completed_jobs, is_verified, avatar, created_at, updated_at)
      VALUES ('RAW_TEST_DELETE', '0000000001', 'tho_xay', 'active', 5, 100000, 800000, 'Test', 'Test', 'Test', 'Raw SQL test', ARRAY['test'], ARRAY[]::text[], 4.0, 0, 0, 0, false, '', NOW(), NOW())
    `);
    console.log("Raw SQL insert result:", result);

    // Try to read it back with Prisma
    try {
      const w = await p.worker.findFirst({ where: { phone: "0000000001" } });
      console.log("Read back:", JSON.stringify(w));
    } catch (readErr) {
      console.error("Read back error:", readErr.message);
    }

    // Clean up
    await p.$executeRawUnsafe("DELETE FROM workers WHERE phone = '0000000001'");
    console.log("Cleaned up");
  } catch (e) {
    console.error("Raw insert error:", e.message);
  }

  await p.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
