// Phase 3b: Seed materials with correct schema types
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedMaterials() {
  const materials = [
    {
      category: "cement",
      name: "Xi măng Hà Tiên PCB40",
      unit: "bao",
      unitPrice: 95000,
      description: "Xi măng pooc-lăng hỗn hợp PCB40, bao 50kg",
      tags: ["xi măng", "kết cấu"],
      userId: "9",
    },
    {
      category: "cement",
      name: "Xi măng Nghi Sơn PC50",
      unit: "bao",
      unitPrice: 110000,
      description: "Xi măng cường độ cao PC50, bao 50kg",
      tags: ["xi măng", "cao cấp"],
      userId: "9",
    },
    {
      category: "steel",
      name: "Thép Pomina phi 12",
      unit: "cây",
      unitPrice: 145000,
      description: "Thép cuộn cán nóng CB300V phi 12mm, dài 11.7m",
      tags: ["thép", "kết cấu"],
      userId: "9",
    },
    {
      category: "steel",
      name: "Thép Pomina phi 16",
      unit: "cây",
      unitPrice: 258000,
      description: "Thép cuộn cán nóng CB300V phi 16mm, dài 11.7m",
      tags: ["thép", "kết cấu"],
      userId: "9",
    },
    {
      category: "brick",
      name: "Gạch ống 4 lỗ",
      unit: "viên",
      unitPrice: 1200,
      description: "Gạch xây tường 4 lỗ kích thước 8x8x18cm",
      tags: ["gạch", "tường"],
      userId: "9",
    },
    {
      category: "brick",
      name: "Gạch block 15x20x40",
      unit: "viên",
      unitPrice: 5500,
      description: "Gạch block bê tông rỗng 15x20x40cm",
      tags: ["gạch", "block"],
      userId: "9",
    },
    {
      category: "sand",
      name: "Cát xây trộn",
      unit: "m3",
      unitPrice: 350000,
      description: "Cát sông đã sàng lọc, dùng để trộn vữa xây",
      tags: ["cát", "xây"],
      userId: "9",
    },
    {
      category: "sand",
      name: "Cát san lấp",
      unit: "m3",
      unitPrice: 180000,
      description: "Cát san lấp nền, bồi đắp mặt bằng",
      tags: ["cát", "san lấp"],
      userId: "9",
    },
    {
      category: "paint",
      name: "Sơn Dulux EasyClean 5L",
      unit: "thùng",
      unitPrice: 680000,
      description: "Sơn nội thất Dulux EasyClean lau chùi hiệu quả, 5 lít",
      tags: ["sơn", "nội thất"],
      userId: "9",
    },
    {
      category: "paint",
      name: "Sơn lót Jotun Essence",
      unit: "thùng",
      unitPrice: 450000,
      description: "Sơn lót chống kiềm nội thất Jotun, 5 lít",
      tags: ["sơn", "lót"],
      userId: "9",
    },
    {
      category: "tile",
      name: "Gạch lát nền 60x60 Viglacera",
      unit: "m2",
      unitPrice: 195000,
      description: "Gạch men lát nền bóng kiếng 60x60cm",
      tags: ["gạch", "nền"],
      userId: "9",
    },
    {
      category: "tile",
      name: "Gạch ốp tường 30x60",
      unit: "m2",
      unitPrice: 165000,
      description: "Gạch men ốp tường 30x60cm, màu trắng",
      tags: ["gạch", "ốp tường"],
      userId: "9",
    },
    {
      category: "wood",
      name: "Gỗ thông nhập khẩu 2x4",
      unit: "thanh",
      unitPrice: 85000,
      description: "Gỗ thông Newland 2x4 inches, dài 2.4m, đã tẩm sấy",
      tags: ["gỗ", "thông"],
      userId: "9",
    },
    {
      category: "electrical",
      name: "Dây điện LS VINA 2.5mm",
      unit: "cuộn",
      unitPrice: 520000,
      description: "Dây điện đơn mềm CVV 1x2.5mm², cuộn 100m",
      tags: ["điện", "dây"],
      userId: "9",
    },
    {
      category: "plumbing",
      name: "Ống nước PPR phi 25",
      unit: "cây",
      unitPrice: 42000,
      description: "Ống PPR Bình Minh phi 25mm, dài 4m, chịu nhiệt",
      tags: ["nước", "ống"],
      userId: "9",
    },
  ];

  let created = 0;
  for (const m of materials) {
    try {
      await prisma.material.create({ data: m });
      created++;
      console.log(`  Created: ${m.name}`);
    } catch (e) {
      console.log(`  ERROR ${m.name}: ${e.message.substring(0, 120)}`);
    }
  }
  console.log(`\nMaterials: ${created} created`);
  console.log(`Total materials: ${await prisma.material.count()}`);
  await prisma.$disconnect();
}

seedMaterials().catch((e) => {
  console.error(e);
  process.exit(1);
});
