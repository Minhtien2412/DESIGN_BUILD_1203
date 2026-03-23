const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const cols = await p.$queryRawUnsafe(
    "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'availability'",
  );
  console.log("availability column:", JSON.stringify(cols));

  // Also check if there's an enum type for availability
  const enums = await p.$queryRawUnsafe(
    "SELECT typname FROM pg_type WHERE typname LIKE '%avail%'",
  );
  console.log("availability-related enums:", JSON.stringify(enums));

  // Check the Prisma DMMF to see expected field type
  const model = p._baseDmmf?.modelMap?.Worker;
  if (model) {
    const field = model.fields.find((f) => f.name === "availability");
    console.log("Prisma model field:", JSON.stringify(field));
  }

  await p.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
