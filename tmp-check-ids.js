const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
async function main() {
  // Just get all IDs
  const workers = await p.worker.findMany({
    select: { id: true, name: true },
    orderBy: { id: "asc" },
  });
  console.log("All worker IDs:");
  workers.forEach((w) => console.log(`  ${w.id}: ${w.name}`));
  console.log("Total:", workers.length);

  // Test findOne via API
  const http = require("http");
  const firstNewId = workers.length > 12 ? workers[12].id : workers[0].id;
  const url = `http://localhost:3002/api/v1/workers/${firstNewId}`;
  http.get(
    url,
    { headers: { "X-API-Key": "thietke-resort-api-key-2024" } },
    (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        console.log(`\nGET /workers/${firstNewId}: status=${res.statusCode}`);
        try {
          const d = JSON.parse(body);
          console.log("  name:", d.name, "type:", d.workerType);
        } catch {}
        p.$disconnect();
      });
    },
  );
}
main();
