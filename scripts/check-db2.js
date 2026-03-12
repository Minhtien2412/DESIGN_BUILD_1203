const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const projects = await p.project.findMany({
    take: 3,
    select: { id: true, title: true },
  });
  console.log("Projects:", JSON.stringify(projects));

  const rooms = await p.chatRoom.findMany({
    take: 3,
    select: { id: true, name: true, projectId: true },
  });
  console.log("ChatRooms:", JSON.stringify(rooms));

  if (projects.length === 0) {
    const proj = await p.project.create({
      data: {
        title: "General Chat Project",
        description: "Default project for admin chat rooms",
        status: "IN_PROGRESS",
      },
    });
    console.log("Created project:", proj.id);
  }

  await p.$disconnect();
}
main().catch((e) => {
  console.error(e.message);
  p.$disconnect();
});
