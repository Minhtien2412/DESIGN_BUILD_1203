const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Check if worker_reviews table exists
  const tables = await p.$queryRawUnsafe(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE '%worker%'
  `);
  console.log("WORKER TABLES:", tables);

  // Try include reviews
  try {
    const w = await p.worker.findMany({
      where: { status: "active" },
      take: 1,
      include: { reviews: true },
    });
    console.log("WITH REVIEWS OK:", w.length);
  } catch (e) {
    console.log("WITH REVIEWS FAIL:", e.message.substring(0, 300));
  }

  // Try include bookings
  try {
    const w = await p.worker.findMany({
      where: { status: "active" },
      take: 1,
      include: { bookings: true },
    });
    console.log("WITH BOOKINGS OK:", w.length);
  } catch (e) {
    console.log("WITH BOOKINGS FAIL:", e.message.substring(0, 300));
  }

  // Try without include (service ordering)
  try {
    const w = await p.worker.findMany({
      where: { status: "active" },
      orderBy: { rating: "desc" },
      skip: 0,
      take: 2,
    });
    console.log("BASIC FINDMANY:", w.length);
    if (w[0]) console.log("FIELDS:", Object.keys(w[0]).join(", "));
  } catch (e) {
    console.log("BASIC FAIL:", e.message.substring(0, 300));
  }

  await p.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
