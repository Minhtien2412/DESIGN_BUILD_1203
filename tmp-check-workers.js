const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const count = await p.worker.count();
  console.log("TOTAL_WORKERS:", count);

  const byType = await p.worker.groupBy({
    by: ["workerType"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });
  console.log("BY_TYPE:", JSON.stringify(byType, null, 2));

  const sample = await p.worker.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      workerType: true,
      status: true,
      rating: true,
      location: true,
      district: true,
      city: true,
      dailyRate: true,
      hourlyRate: true,
      experienceYears: true,
      phone: true,
      avatar: true,
      description: true,
      specialties: true,
      isVerified: true,
      completedJobs: true,
      totalReviews: true,
      totalJobs: true,
    },
  });
  console.log("SAMPLE:", JSON.stringify(sample, null, 2));

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
