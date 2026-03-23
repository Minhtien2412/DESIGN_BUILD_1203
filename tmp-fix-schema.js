const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // 1. Check if availability column exists
  const cols = await p.$queryRawUnsafe(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'workers' 
    ORDER BY ordinal_position
  `);
  console.log("EXISTING COLUMNS:");
  cols.forEach((c) => console.log(" -", c.column_name));

  // 2. Check missing columns the Prisma model expects
  const colNames = cols.map((c) => c.column_name);
  const expected = [
    "id",
    "name",
    "phone",
    "email",
    "avatar",
    "worker_type",
    "status",
    "availability",
    "experience_years",
    "hourly_rate",
    "daily_rate",
    "location",
    "district",
    "city",
    "description",
    "specialties",
    "certifications",
    "rating",
    "total_reviews",
    "total_jobs",
    "completed_jobs",
    "user_id",
    "is_verified",
    "verified_at",
    "created_at",
    "updated_at",
  ];
  const missing = expected.filter((e) => !colNames.includes(e));
  console.log("\nMISSING COLUMNS:", missing);

  // 3. Add missing columns safely
  for (const col of missing) {
    try {
      let sql;
      switch (col) {
        case "availability":
          sql = `ALTER TABLE workers ADD COLUMN availability TEXT DEFAULT 'available'`;
          break;
        case "experience_years":
          sql = `ALTER TABLE workers ADD COLUMN experience_years INTEGER DEFAULT 0`;
          break;
        case "hourly_rate":
          sql = `ALTER TABLE workers ADD COLUMN hourly_rate DECIMAL(10,2)`;
          break;
        case "daily_rate":
          sql = `ALTER TABLE workers ADD COLUMN daily_rate DECIMAL(10,2)`;
          break;
        case "is_verified":
          sql = `ALTER TABLE workers ADD COLUMN is_verified BOOLEAN DEFAULT false`;
          break;
        case "verified_at":
          sql = `ALTER TABLE workers ADD COLUMN verified_at TIMESTAMP`;
          break;
        case "total_reviews":
          sql = `ALTER TABLE workers ADD COLUMN total_reviews INTEGER DEFAULT 0`;
          break;
        case "total_jobs":
          sql = `ALTER TABLE workers ADD COLUMN total_jobs INTEGER DEFAULT 0`;
          break;
        case "completed_jobs":
          sql = `ALTER TABLE workers ADD COLUMN completed_jobs INTEGER DEFAULT 0`;
          break;
        case "city":
          sql = `ALTER TABLE workers ADD COLUMN city TEXT`;
          break;
        case "district":
          sql = `ALTER TABLE workers ADD COLUMN district TEXT`;
          break;
        case "user_id":
          sql = `ALTER TABLE workers ADD COLUMN user_id INTEGER`;
          break;
        default:
          sql = `ALTER TABLE workers ADD COLUMN ${col} TEXT`;
      }
      await p.$executeRawUnsafe(sql);
      console.log("  ADDED:", col);
    } catch (e) {
      if (e.message.includes("already exists")) {
        console.log("  EXISTS:", col);
      } else {
        console.log("  FAIL:", col, "-", e.message.substring(0, 100));
      }
    }
  }

  // 4. Verify findMany works now
  try {
    const workers = await p.worker.findMany({ take: 2 });
    console.log("\nFINDMANY WORKS:", workers.length, "records");
    if (workers[0]) {
      console.log(
        "SAMPLE:",
        JSON.stringify({
          id: workers[0].id,
          name: workers[0].name,
          workerType: workers[0].workerType,
          status: workers[0].status,
          availability: workers[0].availability,
          rating: workers[0].rating,
        }),
      );
    }
  } catch (e) {
    console.log("FINDMANY STILL FAILS:", e.message.substring(0, 200));
  }

  await p.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
