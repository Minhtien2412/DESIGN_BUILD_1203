const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient({ log: ["query", "error", "warn"] });

async function main() {
  try {
    // Test basic count
    const count = await p.worker.count();
    console.log("COUNT:", count);

    // Test basic findMany with where status = 'active'
    const workers = await p.worker.findMany({
      where: { status: "active" },
      take: 3,
    });
    console.log("FIND_STATUS_ACTIVE:", workers.length);
    if (workers[0]) {
      console.log("FIRST_FIELDS:", Object.keys(workers[0]).join(", "));
    }

    // The service does include: { reviews: true } — test if that works
    try {
      const withReviews = await p.worker.findMany({
        where: { status: "active" },
        take: 1,
        include: { reviews: true },
      });
      console.log("WITH_REVIEWS:", withReviews.length);
    } catch (e) {
      console.log("REVIEWS_FAIL:", e.message.substring(0, 200));
    }

    // Test the sortBy rating
    try {
      const sorted = await p.worker.findMany({
        where: { status: "active" },
        orderBy: { rating: "desc" },
        take: 3,
      });
      console.log(
        "SORTED_BY_RATING:",
        sorted.length,
        sorted.map((w) => ({ name: w.name, rating: w.rating })),
      );
    } catch (e) {
      console.log("SORT_FAIL:", e.message.substring(0, 200));
    }
  } catch (e) {
    console.error("ERROR:", e.message.substring(0, 300));
  }
  await p.$disconnect();
}
main();
