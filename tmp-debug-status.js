const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Check the actual status enum values in Postgres
  try {
    const enums = await p.$queryRawUnsafe(`
      SELECT e.enumlabel 
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid 
      WHERE t.typname = 'worker_status'
    `);
    console.log("WORKER_STATUS ENUM VALUES:", enums);
  } catch (e) {
    console.log("ENUM CHECK FAIL:", e.message.substring(0, 200));
  }

  // Check what actual status values exist in the table
  const statuses = await p.$queryRawUnsafe(
    `SELECT DISTINCT status::text FROM workers`,
  );
  console.log("ACTUAL STATUSES IN DB:", statuses);

  // Check column type
  const colType = await p.$queryRawUnsafe(`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'workers' AND column_name = 'status'
  `);
  console.log("STATUS COLUMN TYPE:", colType);

  // Check worker_type enum
  const wtEnums = await p.$queryRawUnsafe(`
    SELECT e.enumlabel 
    FROM pg_enum e 
    JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname = 'worker_type'
  `);
  console.log(
    "WORKER_TYPE ENUM VALUES:",
    wtEnums.map((e) => e.enumlabel),
  );

  // Direct SQL query that mirrors what the service does
  try {
    const rows = await p.$queryRawUnsafe(`
      SELECT id, name, worker_type, status::text, rating 
      FROM workers 
      WHERE status::text = 'active' 
      LIMIT 3
    `);
    console.log("RAW SQL WITH ACTIVE:", rows.length);
  } catch (e) {
    console.log("RAW SQL FAIL:", e.message.substring(0, 200));
  }

  // Test via Prisma ORM with explicit string comparison
  try {
    const workers = await p.worker.findMany({
      where: { status: "active" },
      take: 3,
      select: { id: true, name: true, status: true, workerType: true },
    });
    console.log("PRISMA WITH STATUS=active:", workers.length);
    if (workers.length > 0) console.log("FIRST:", workers[0]);
  } catch (e) {
    console.log("PRISMA FAIL:", e.message.substring(0, 200));
  }

  await p.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
