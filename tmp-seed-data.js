// Phase 3: Comprehensive data seeding — workers, services, materials, reviews
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seed() {
  console.log("Starting Phase 3 data seeding...\n");

  // ======================== WORKERS ========================
  const workerData = [
    {
      name: "Nguyễn Văn Minh",
      phone: "0901234567",
      email: "minh.nguyen@example.com",
      workerType: "tho_dien",
      experienceYears: 12,
      hourlyRate: 150000,
      dailyRate: 1200000,
      location: "Quận 1",
      district: "Quận 1",
      city: "TP.HCM",
      description:
        "Thợ điện kinh nghiệm 12 năm, chuyên lắp đặt hệ thống điện nhà phố và biệt thự",
      specialties: ["điện dân dụng", "điện công nghiệp", "camera an ninh"],
      certifications: ["Chứng chỉ an toàn điện", "Thợ điện hạng 3"],
      rating: 4.8,
      totalReviews: 45,
      totalJobs: 120,
      completedJobs: 115,
      isVerified: true,
      status: "active",
      availability: "available",
    },
    {
      name: "Trần Đức Thắng",
      phone: "0912345678",
      email: "thang.tran@example.com",
      workerType: "tho_xay",
      experienceYears: 15,
      hourlyRate: 180000,
      dailyRate: 1400000,
      location: "Quận Bình Thạnh",
      district: "Bình Thạnh",
      city: "TP.HCM",
      description:
        "Thợ xây dựng chuyên xây thô, trát, hoàn thiện. 15 năm kinh nghiệm.",
      specialties: ["xây thô", "trát tường", "ốp tường"],
      certifications: ["Chứng chỉ ATLĐ"],
      rating: 4.6,
      totalReviews: 38,
      totalJobs: 95,
      completedJobs: 90,
      isVerified: true,
      status: "active",
      availability: "available",
    },
    {
      name: "Lê Hoàng Phúc",
      phone: "0923456789",
      email: "phuc.le@example.com",
      workerType: "tho_son",
      experienceYears: 8,
      hourlyRate: 120000,
      dailyRate: 950000,
      location: "Quận 7",
      district: "Quận 7",
      city: "TP.HCM",
      description:
        "Sơn nước, sơn dầu, sơn trang trí. Thi công tỉ mỉ, đúng hẹn.",
      specialties: ["sơn nội thất", "sơn ngoại thất", "sơn trang trí"],
      certifications: [],
      rating: 4.5,
      totalReviews: 25,
      totalJobs: 60,
      completedJobs: 58,
      isVerified: true,
      status: "active",
      availability: "available",
    },
    {
      name: "Phạm Thanh Sơn",
      phone: "0934567890",
      email: "son.pham@example.com",
      workerType: "tho_nuoc",
      experienceYears: 10,
      hourlyRate: 140000,
      dailyRate: 1100000,
      location: "Quận 2",
      district: "Quận 2",
      city: "TP.HCM",
      description:
        "Chuyên lắp đặt và sửa chữa hệ thống nước, phòng vệ sinh, bể bơi mini.",
      specialties: ["ống nước PPR", "bể phốt", "phòng tắm"],
      certifications: ["Thợ nước bậc 4/7"],
      rating: 4.7,
      totalReviews: 32,
      totalJobs: 80,
      completedJobs: 78,
      isVerified: true,
      status: "active",
      availability: "available",
    },
    {
      name: "Hoàng Văn Tùng",
      phone: "0945678901",
      email: "tung.hoang@example.com",
      workerType: "tho_moc",
      experienceYears: 20,
      hourlyRate: 200000,
      dailyRate: 1600000,
      location: "Quận Gò Vấp",
      district: "Gò Vấp",
      city: "TP.HCM",
      description:
        "Thợ mộc 20 năm kinh nghiệm, chuyên đồ gỗ nội thất, cầu thang, cửa.",
      specialties: ["nội thất gỗ", "cầu thang", "cửa gỗ", "tủ bếp"],
      certifications: ["Nghệ nhân gỗ"],
      rating: 4.9,
      totalReviews: 52,
      totalJobs: 150,
      completedJobs: 148,
      isVerified: true,
      status: "active",
      availability: "busy",
    },
    {
      name: "Đỗ Quang Huy",
      phone: "0956789012",
      email: "huy.do@example.com",
      workerType: "tho_sat",
      experienceYears: 7,
      hourlyRate: 130000,
      dailyRate: 1000000,
      location: "Quận 9",
      district: "Quận 9",
      city: "TP.HCM",
      description:
        "Gia công sắt, inox, cổng, hàng rào, khung nhà thép tiền chế.",
      specialties: ["hàn sắt", "cổng sắt", "mái tôn", "khung thép"],
      certifications: ["Chứng chỉ hàn 3G"],
      rating: 4.4,
      totalReviews: 20,
      totalJobs: 50,
      completedJobs: 48,
      isVerified: false,
      status: "active",
      availability: "available",
    },
    {
      name: "Vũ Thị Lan",
      phone: "0967890123",
      email: "lan.vu@example.com",
      workerType: "tho_op_lat",
      experienceYears: 6,
      hourlyRate: 110000,
      dailyRate: 880000,
      location: "Quận Tân Bình",
      district: "Tân Bình",
      city: "TP.HCM",
      description:
        "Thợ ốp lát gạch nữ, tỉ mỉ và sáng tạo. Chuyên phòng tắm và bếp.",
      specialties: ["ốp gạch", "lát nền", "gạch mosaic"],
      certifications: [],
      rating: 4.3,
      totalReviews: 15,
      totalJobs: 35,
      completedJobs: 34,
      isVerified: true,
      status: "active",
      availability: "available",
    },
    {
      name: "Bùi Minh Quân",
      phone: "0978901234",
      email: "quan.bui@example.com",
      workerType: "tho_nhom",
      experienceYears: 9,
      hourlyRate: 160000,
      dailyRate: 1300000,
      location: "Quận 12",
      district: "Quận 12",
      city: "TP.HCM",
      description:
        "Nhôm kính, cửa nhôm Xingfa, vách kính, mái kính, cửa sổ trượt.",
      specialties: ["nhôm Xingfa", "kính cường lực", "vách kính"],
      certifications: ["Chứng chỉ hãng Xingfa"],
      rating: 4.6,
      totalReviews: 28,
      totalJobs: 70,
      completedJobs: 68,
      isVerified: true,
      status: "active",
      availability: "available",
    },
    {
      name: "Ngô Đình Khoa",
      phone: "0989012345",
      email: "khoa.ngo@example.com",
      workerType: "ky_su",
      experienceYears: 8,
      hourlyRate: 300000,
      dailyRate: 2400000,
      location: "Quận 3",
      district: "Quận 3",
      city: "TP.HCM",
      description:
        "Kỹ sư xây dựng, quản lý thi công, giám sát chất lượng công trình.",
      specialties: ["quản lý dự án", "giám sát thi công", "thiết kế kết cấu"],
      certifications: ["Kỹ sư xây dựng", "PMP"],
      rating: 4.8,
      totalReviews: 18,
      totalJobs: 25,
      completedJobs: 24,
      isVerified: true,
      status: "active",
      availability: "available",
    },
    {
      name: "Trương Văn Đạt",
      phone: "0990123456",
      email: "dat.truong@example.com",
      workerType: "giam_sat",
      experienceYears: 14,
      hourlyRate: 250000,
      dailyRate: 2000000,
      location: "Quận Thủ Đức",
      district: "Thủ Đức",
      city: "TP.HCM",
      description:
        "Giám sát thi công 14 năm kinh nghiệm. Đảm bảo tiến độ và chất lượng.",
      specialties: ["giám sát xây dựng", "nghiệm thu", "kiểm tra chất lượng"],
      certifications: ["Giám sát xây dựng hạng 2"],
      rating: 4.7,
      totalReviews: 22,
      totalJobs: 40,
      completedJobs: 39,
      isVerified: true,
      status: "active",
      availability: "available",
    },
    {
      name: "Lý Thanh Phong",
      phone: "0901122334",
      email: "phong.ly@example.com",
      workerType: "tho_tran_thach_cao",
      experienceYears: 5,
      hourlyRate: 100000,
      dailyRate: 800000,
      location: "Quận Bình Tân",
      district: "Bình Tân",
      city: "TP.HCM",
      description: "Thi công trần thạch cao, vách ngăn, hộp đèn, phào chỉ.",
      specialties: ["trần thạch cao", "vách ngăn", "hộp đèn"],
      certifications: [],
      rating: 4.2,
      totalReviews: 12,
      totalJobs: 30,
      completedJobs: 28,
      isVerified: false,
      status: "active",
      availability: "available",
    },
    {
      name: "Phan Quốc Bảo",
      phone: "0912233445",
      email: "bao.phan@example.com",
      workerType: "tho_may_lanh",
      experienceYears: 6,
      hourlyRate: 140000,
      dailyRate: 1100000,
      location: "Quận 5",
      district: "Quận 5",
      city: "TP.HCM",
      description: "Lắp đặt và bảo trì máy lạnh Daikin, Panasonic, Mitsubishi.",
      specialties: ["máy lạnh", "máy lạnh trung tâm", "VRV"],
      certifications: ["Kỹ thuật viên Daikin"],
      rating: 4.5,
      totalReviews: 30,
      totalJobs: 85,
      completedJobs: 83,
      isVerified: true,
      status: "active",
      availability: "available",
    },
  ];

  let createdWorkers = 0;
  for (const w of workerData) {
    try {
      const existing = await prisma.worker.findFirst({
        where: { phone: w.phone },
      });
      if (existing) {
        console.log(`  Skip worker: ${w.name} (exists)`);
        continue;
      }
      await prisma.worker.create({ data: w });
      createdWorkers++;
      console.log(`  Created worker: ${w.name} (${w.workerType})`);
    } catch (e) {
      console.log(`  ERROR worker ${w.name}: ${e.message.substring(0, 80)}`);
    }
  }
  console.log(`Workers: ${createdWorkers} created\n`);

  // ======================== WORKER REVIEWS ========================
  const workers = await prisma.worker.findMany({ take: 5 });
  let createdReviews = 0;
  const reviewTexts = [
    "Thợ rất giỏi, thi công nhanh và sạch sẽ. Rất hài lòng!",
    "Làm việc chuyên nghiệp, đúng hẹn. Sẽ thuê lại lần sau.",
    "Chất lượng tốt, giá hợp lý. Recommend cho mọi người.",
    "Thợ nhiệt tình, tư vấn tận tâm. Kết quả đẹp hơn mong đợi.",
    "Tay nghề cao, cẩn thận từng chi tiết. 5 sao!",
  ];
  for (const w of workers) {
    for (let i = 0; i < 3; i++) {
      try {
        await prisma.workerReview.create({
          data: {
            workerId: w.id,
            reviewerId: 9,
            rating: 4 + Math.floor(Math.random() * 2),
            comment:
              reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
            projectName: "Dự án xây nhà " + (i + 1),
          },
        });
        createdReviews++;
      } catch (e) {
        console.log(
          `  ERROR review for ${w.name}: ${e.message.substring(0, 60)}`,
        );
      }
    }
  }
  console.log(`Worker reviews: ${createdReviews} created\n`);

  // ======================== MATERIALS (if none exist) ========================
  const matCount = await prisma.material.count();
  if (matCount > 0) {
    console.log(`Materials: ${matCount} already exist, skipping\n`);
  } else {
    const materials = [
      {
        category: "cement",
        name: "Xi măng Hà Tiên PCB40",
        unit: "bao",
        unitPrice: 95000,
        description: "Xi măng pooc-lăng hỗn hợp PCB40, bao 50kg",
        tags: ["xi măng", "kết cấu"],
        userId: 9,
      },
      {
        category: "cement",
        name: "Xi măng Nghi Sơn PC50",
        unit: "bao",
        unitPrice: 110000,
        description: "Xi măng cường độ cao PC50, bao 50kg",
        tags: ["xi măng", "cao cấp"],
        userId: 9,
      },
      {
        category: "steel",
        name: "Thép Pomina phi 12",
        unit: "cây",
        unitPrice: 145000,
        description: "Thép cuộn cán nóng CB300V phi 12mm, dài 11.7m",
        tags: ["thép", "kết cấu"],
        userId: 9,
      },
      {
        category: "steel",
        name: "Thép Pomina phi 16",
        unit: "cây",
        unitPrice: 258000,
        description: "Thép cuộn cán nóng CB300V phi 16mm, dài 11.7m",
        tags: ["thép", "kết cấu"],
        userId: 9,
      },
      {
        category: "brick",
        name: "Gạch ống 4 lỗ",
        unit: "viên",
        unitPrice: 1200,
        description: "Gạch xây tường 4 lỗ kích thước 8x8x18cm",
        tags: ["gạch", "tường"],
        userId: 9,
      },
      {
        category: "brick",
        name: "Gạch block 15x20x40",
        unit: "viên",
        unitPrice: 5500,
        description: "Gạch block bê tông rỗng 15x20x40cm",
        tags: ["gạch", "block"],
        userId: 9,
      },
      {
        category: "sand",
        name: "Cát xây trộn",
        unit: "m3",
        unitPrice: 350000,
        description: "Cát sông đã sàng lọc, dùng để trộn vữa xây",
        tags: ["cát", "xây"],
        userId: 9,
      },
      {
        category: "sand",
        name: "Cát san lấp",
        unit: "m3",
        unitPrice: 180000,
        description: "Cát san lấp nền, bồi đắp mặt bằng",
        tags: ["cát", "san lấp"],
        userId: 9,
      },
      {
        category: "paint",
        name: "Sơn Dulux EasyClean 5L",
        unit: "thùng",
        unitPrice: 680000,
        description: "Sơn nội thất Dulux EasyClean lau chùi hiệu quả, 5 lít",
        tags: ["sơn", "nội thất"],
        userId: 9,
      },
      {
        category: "paint",
        name: "Sơn lót Jotun Essence",
        unit: "thùng",
        unitPrice: 450000,
        description: "Sơn lót chống kiềm nội thất Jotun, 5 lít",
        tags: ["sơn", "lót"],
        userId: 9,
      },
      {
        category: "tile",
        name: "Gạch lát nền 60x60 Viglacera",
        unit: "m2",
        unitPrice: 195000,
        description: "Gạch men lát nền bóng kiếng 60x60cm",
        tags: ["gạch", "nền"],
        userId: 9,
      },
      {
        category: "tile",
        name: "Gạch ốp tường 30x60",
        unit: "m2",
        unitPrice: 165000,
        description: "Gạch men ốp tường 30x60cm, màu trắng",
        tags: ["gạch", "ốp tường"],
        userId: 9,
      },
      {
        category: "wood",
        name: "Gỗ thông nhập khẩu 2x4",
        unit: "thanh",
        unitPrice: 85000,
        description: "Gỗ thông Newland 2x4 inches, dài 2.4m, đã tẩm sấy",
        tags: ["gỗ", "thông"],
        userId: 9,
      },
      {
        category: "electrical",
        name: "Dây điện LS VINA 2.5mm",
        unit: "cuộn",
        unitPrice: 520000,
        description: "Dây điện đơn mềm CVV 1x2.5mm², cuộn 100m",
        tags: ["điện", "dây"],
        userId: 9,
      },
      {
        category: "plumbing",
        name: "Ống nước PPR phi 25",
        unit: "cây",
        unitPrice: 42000,
        description: "Ống PPR Bình Minh phi 25mm, dài 4m, chịu nhiệt",
        tags: ["nước", "ống"],
        userId: 9,
      },
    ];
    let matCreated = 0;
    for (const m of materials) {
      try {
        await prisma.material.create({ data: m });
        matCreated++;
      } catch (e) {
        console.log(
          `  ERROR material ${m.name}: ${e.message.substring(0, 80)}`,
        );
      }
    }
    console.log(`Materials: ${matCreated} created\n`);
  }

  // ======================== SERVICES ========================
  const svcCount = await prisma.service.count();
  if (svcCount > 0) {
    console.log(`Services: ${svcCount} already exist, skipping\n`);
  } else {
    const services = [
      {
        name: "Thi công điện dân dụng",
        description:
          "Lắp đặt hệ thống điện hoàn chỉnh cho nhà ở: đi dây, lắp tủ điện, ổ cắm, công tắc, đèn.",
        category: "CONSTRUCTION",
        price: 150000,
        unit: "điểm",
        duration: "1-2 ngày/phòng",
        features: ["Tư vấn thiết kế", "Vật tư chính hãng", "Bảo hành 12 tháng"],
        createdBy: 9,
      },
      {
        name: "Sơn nhà trọn gói",
        description:
          "Dịch vụ sơn nhà trọn gói: cạo sơn cũ, trám trét, sơn lót + 2 lớp phủ.",
        category: "CONSTRUCTION",
        price: 45000,
        unit: "m2",
        duration: "3-5 ngày",
        features: ["Sơn Dulux chính hãng", "Bảo hành 2 năm", "Vệ sinh sạch sẽ"],
        createdBy: 9,
      },
      {
        name: "Lắp đặt hệ thống nước",
        description:
          "Thi công đường ống cấp thoát nước cho nhà ở, văn phòng, nhà xưởng.",
        category: "CONSTRUCTION",
        price: 120000,
        unit: "điểm",
        duration: "2-3 ngày",
        features: ["Ống PPR chính hãng", "Test áp lực", "Bảo hành 12 tháng"],
        createdBy: 9,
      },
      {
        name: "Ốp lát gạch phòng tắm",
        description:
          "Ốp tường và lát nền gạch phòng tắm, bếp. Thi công tỉ mỉ, đường ron đều.",
        category: "CONSTRUCTION",
        price: 80000,
        unit: "m2",
        duration: "2-4 ngày",
        features: ["Keo dán chuyên dụng", "Cắt gạch CNC", "Bảo hành 5 năm"],
        createdBy: 9,
      },
      {
        name: "Thiết kế nội thất 3D",
        description:
          "Thiết kế nội thất 3D chi tiết cho toàn bộ căn nhà/căn hộ.",
        category: "DESIGN",
        price: 80000,
        unit: "m2",
        duration: "7-14 ngày",
        features: [
          "Render 3D photorealistic",
          "3 phương án",
          "Chỉnh sửa 2 lần",
        ],
        createdBy: 9,
      },
      {
        name: "Lắp đặt máy lạnh",
        description:
          "Lắp đặt máy lạnh treo tường, âm trần, multi cho nhà ở và văn phòng.",
        category: "CONSTRUCTION",
        price: 500000,
        unit: "bộ",
        duration: "1 ngày",
        features: ["Thợ hãng chính hãng", "Ống đồng chuẩn", "Bảo hành 1 năm"],
        createdBy: 9,
      },
      {
        name: "Giám sát thi công",
        description:
          "Dịch vụ giám sát thi công xây dựng, đảm bảo tiến độ và chất lượng.",
        category: "CONSULTING",
        price: 2000000,
        unit: "tháng",
        duration: "Toàn bộ dự án",
        features: [
          "Báo cáo hàng tuần",
          "Kiểm tra chất lượng",
          "Tư vấn kỹ thuật",
        ],
        createdBy: 9,
      },
      {
        name: "Thi công cổng sắt",
        description:
          "Gia công và lắp đặt cổng sắt, hàng rào, lan can sắt mỹ thuật.",
        category: "CONSTRUCTION",
        price: 1800000,
        unit: "m2",
        duration: "5-7 ngày",
        features: ["Sơn tĩnh điện", "Thiết kế theo yêu cầu", "Bảo hành 3 năm"],
        createdBy: 9,
      },
    ];
    let svcCreated = 0;
    for (const s of services) {
      try {
        await prisma.service.create({ data: s });
        svcCreated++;
      } catch (e) {
        console.log(`  ERROR service ${s.name}: ${e.message.substring(0, 80)}`);
      }
    }
    console.log(`Services: ${svcCreated} created\n`);
  }

  // ======================== SUMMARY ========================
  const counts = {
    users: await prisma.user.count(),
    workers: await prisma.worker.count(),
    workerReviews: await prisma.workerReview.count(),
    materials: await prisma.material.count(),
    services: await prisma.service.count(),
    projects: await prisma.project.count(),
    tasks: await prisma.task.count(),
  };
  console.log("=== Database Summary ===");
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k}: ${v}`);
  }

  await prisma.$disconnect();
  console.log("\nSeeding complete!");
}

seed().catch((e) => {
  console.error("Seed error:", e.message);
  process.exit(1);
});
