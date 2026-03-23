const fs = require("fs");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

async function resetAdmin() {
  const prisma = new PrismaClient();
  try {
    const hash = await bcrypt.hash("Admin@2024!", 10);
    await prisma.user.update({
      where: { id: 1 },
      data: { password: hash },
    });
    console.log("Admin password reset to: Admin@2024!");
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();
