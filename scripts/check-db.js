const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Check existing projects
  const projects = await p.project.findMany({
    take: 5,
    select: { id: true, name: true },
  });
  console.log("Projects:", JSON.stringify(projects));

  // Check existing chat rooms
  const rooms = await p.chatRoom.findMany({
    take: 5,
    select: { id: true, name: true, projectId: true },
  });
  console.log("ChatRooms:", JSON.stringify(rooms));

  // If no projects, create a default one
  if (projects.length === 0) {
    const defaultProject = await p.project.create({
      data: {
        name: "General Chat Project",
        description: "Default project for admin chat rooms",
        status: "IN_PROGRESS",
      },
    });
    console.log("Created default project:", defaultProject.id);
  } else {
    console.log("First project ID:", projects[0].id);
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e.message);
  p.$disconnect();
});
