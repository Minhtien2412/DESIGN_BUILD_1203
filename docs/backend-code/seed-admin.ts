import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Services and Utilities...');

  // Get admin user (assuming ID 1 or first user)
  const adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin@test.com' },
        { email: 'admin@baotienweb.cloud' },
        { role: 'ADMIN' },
      ],
    },
  });

  if (!adminUser) {
    console.error('❌ No admin user found. Please create an admin user first.');
    return;
  }

  console.log(`✅ Using admin user: ${adminUser.email} (ID: ${adminUser.id})`);

  // ==================== SEED SERVICES ====================
  console.log('\n📦 Creating Services...');

  const servicesData = [
    {
      name: 'Thiết kế kiến trúc',
      description: 'Thiết kế bản vẽ kiến trúc 2D/3D chuyên nghiệp cho nhà ở, biệt thự, chung cư. Bao gồm mặt bằng, mặt đứng, mặt cắt và hình ảnh 3D photorealistic.',
      category: 'DESIGN',
      price: 500000,
      unit: 'm²',
      duration: '2-3 tháng',
      features: ['Bản vẽ 3D', 'File CAD', 'Tư vấn miễn phí', 'Chỉnh sửa 3 lần'],
      status: 'ACTIVE',
    },
    {
      name: 'Thiết kế nội thất',
      description: 'Thiết kế nội thất theo phong cách hiện đại, cổ điển, tân cổ điển. Tối ưu không gian và công năng sử dụng.',
      category: 'DESIGN',
      price: 350000,
      unit: 'm²',
      duration: '1-2 tháng',
      features: ['Bản vẽ chi tiết', 'Phối cảnh 3D', 'Báo giá vật liệu', 'Tư vấn phong thủy'],
      status: 'ACTIVE',
    },
    {
      name: 'Thi công phần thô',
      description: 'Thi công xây dựng phần thô hoàn chỉnh: móng, cột, dầm, sàn, tường, mái. Đảm bảo chất lượng theo tiêu chuẩn.',
      category: 'CONSTRUCTION',
      price: 3500000,
      unit: 'm²',
      duration: '4-6 tháng',
      features: ['Móng bê tông cốt thép', 'Cột dầm sàn', 'Tường gạch', 'Mái bê tông/tôn'],
      status: 'ACTIVE',
    },
    {
      name: 'Thi công hoàn thiện',
      description: 'Hoàn thiện công trình: ốp lát, sơn, trần thạch cao, cửa, hệ thống điện nước.',
      category: 'CONSTRUCTION',
      price: 2800000,
      unit: 'm²',
      duration: '2-4 tháng',
      features: ['Ốp lát gạch', 'Sơn nước', 'Trần thạch cao', 'Cửa gỗ/nhôm kính'],
      status: 'ACTIVE',
    },
    {
      name: 'Hoàn thiện nội thất',
      description: 'Hoàn thiện nội thất cao cấp: tủ bếp, tủ áo, giường, bàn ghế, đèn, rèm.',
      category: 'FINISHING',
      price: 2500000,
      unit: 'm²',
      duration: '2-3 tháng',
      features: ['Tủ bếp gỗ công nghiệp', 'Sàn gỗ/sàn nhựa', 'Đèn trang trí', 'Rèm cửa'],
      status: 'ACTIVE',
    },
    {
      name: 'Sơn nước cao cấp',
      description: 'Thi công sơn nước nội thất, ngoại thất với các thương hiệu uy tín.',
      category: 'FINISHING',
      price: 150000,
      unit: 'm²',
      duration: '1-2 tuần',
      features: ['Sơn Dulux/Jotun', 'Bả matit 2 lớp', 'Bảo hành 2 năm'],
      status: 'ACTIVE',
    },
    {
      name: 'Tư vấn xây dựng',
      description: 'Tư vấn giải pháp xây dựng, lựa chọn vật liệu, ước tính chi phí, lên kế hoạch thi công.',
      category: 'CONSULTING',
      price: 5000000,
      unit: 'dự án',
      duration: '1-2 tuần',
      features: ['Khảo sát thực địa', 'Báo cáo chi tiết', 'Ước tính chi phí', 'Lộ trình thi công'],
      status: 'ACTIVE',
    },
    {
      name: 'Tư vấn thiết kế',
      description: 'Tư vấn phong cách thiết kế, màu sắc, vật liệu phù hợp với nhu cầu và ngân sách.',
      category: 'CONSULTING',
      price: 3000000,
      unit: 'dự án',
      duration: '1 tuần',
      features: ['Moodboard ý tưởng', 'Chọn vật liệu', 'Phối màu', 'Báo giá sơ bộ'],
      status: 'ACTIVE',
    },
    {
      name: 'Giám sát thi công',
      description: 'Giám sát chất lượng thi công, kiểm tra tiến độ, nghiệm thu từng hạng mục.',
      category: 'INSPECTION',
      price: 1500000,
      unit: 'tháng',
      duration: 'Theo tiến độ',
      features: ['Kiểm tra hàng ngày', 'Báo cáo tuần', 'Nghiệm thu hạng mục', 'Tư vấn xử lý'],
      status: 'ACTIVE',
    },
    {
      name: 'Nghiệm thu công trình',
      description: 'Nghiệm thu chất lượng công trình trước khi bàn giao. Lập biên bản chi tiết.',
      category: 'INSPECTION',
      price: 2000000,
      unit: 'công trình',
      duration: '1-3 ngày',
      features: ['Kiểm tra toàn bộ hạng mục', 'Đo đạc kích thước', 'Lập biên bản', 'Danh sách sửa chữa'],
      status: 'ACTIVE',
    },
    {
      name: 'Bảo trì định kỳ',
      description: 'Bảo trì công trình định kỳ: kiểm tra, sửa chữa nhỏ, làm sạch, bảo dưỡng.',
      category: 'MAINTENANCE',
      price: 800000,
      unit: 'lần',
      duration: '1 ngày',
      features: ['Kiểm tra tổng thể', 'Sửa chữa nhỏ', 'Vệ sinh', 'Báo cáo tình trạng'],
      status: 'ACTIVE',
    },
    {
      name: 'Sửa chữa cải tạo',
      description: 'Sửa chữa, cải tạo lại công trình cũ: thay cửa, sơn lại, chống thấm, sửa điện nước.',
      category: 'MAINTENANCE',
      price: 1200000,
      unit: 'm²',
      duration: '1-2 tuần',
      features: ['Đánh giá hiện trạng', 'Phương án sửa chữa', 'Thi công nhanh', 'Bảo hành 1 năm'],
      status: 'ACTIVE',
    },
  ];

  const services = [];
  for (const data of servicesData) {
    const service = await prisma.service.upsert({
      where: { name: data.name },
      update: {},
      create: {
        ...data,
        createdBy: adminUser.id,
      },
    });
    services.push(service);
    console.log(`  ✅ ${service.name}`);
  }

  console.log(`\n✅ Created ${services.length} services`);

  // ==================== SEED UTILITIES ====================
  console.log('\n🔧 Creating Utilities...');

  const utilitiesData = [
    {
      name: 'Tính toán vật liệu',
      description: 'Công cụ tính toán lượng vật liệu cần thiết cho công trình: gạch, xi măng, cát, sắt thép.',
      type: 'CALCULATOR',
      icon: 'calculator-outline',
      color: '#3B82F6',
      route: '/utilities/material-calculator',
      enabled: true,
    },
    {
      name: 'Tính toán chi phí',
      description: 'Ước tính chi phí xây dựng dựa trên diện tích và loại công trình.',
      type: 'CALCULATOR',
      icon: 'cash-outline',
      color: '#10B981',
      route: '/utilities/cost-calculator',
      enabled: true,
    },
    {
      name: 'Trò chuyện AI',
      description: 'Tư vấn xây dựng bằng trí tuệ nhân tạo. Hỏi đáp về vật liệu, thiết kế, thi công.',
      type: 'AI',
      icon: 'chatbubbles-outline',
      color: '#666666',
      route: '/utilities/ai-chat',
      enabled: true,
    },
    {
      name: 'Phân tích hình ảnh AI',
      description: 'Phân tích hình ảnh công trình, nhận diện vật liệu, phát hiện lỗi thi công.',
      type: 'AI',
      icon: 'camera-outline',
      color: '#A855F7',
      route: '/utilities/ai-image-analysis',
      enabled: true,
    },
    {
      name: 'Live Stream',
      description: 'Phát trực tiếp tiến độ công trình. Xem mọi lúc mọi nơi.',
      type: 'MEDIA',
      icon: 'videocam-outline',
      color: '#EF4444',
      route: '/live',
      enabled: true,
    },
    {
      name: 'Thư viện video',
      description: 'Thư viện video hướng dẫn thi công, kỹ thuật xây dựng.',
      type: 'MEDIA',
      icon: 'play-circle-outline',
      color: '#F59E0B',
      route: '/videos',
      enabled: true,
    },
    {
      name: 'Tài liệu kỹ thuật',
      description: 'Tài liệu, tiêu chuẩn xây dựng Việt Nam. Download miễn phí.',
      type: 'DOCUMENT',
      icon: 'document-text-outline',
      color: '#06B6D4',
      route: '/utilities/documents',
      enabled: true,
    },
    {
      name: 'Hợp đồng mẫu',
      description: 'Các mẫu hợp đồng xây dựng chuẩn. Download và chỉnh sửa.',
      type: 'DOCUMENT',
      icon: 'document-outline',
      color: '#0EA5E9',
      route: '/utilities/contracts',
      enabled: true,
    },
    {
      name: 'Lịch công trình',
      description: 'Quản lý lịch thi công, hẹn gặp kỹ sư, nghiệm thu.',
      type: 'TOOL',
      icon: 'calendar-outline',
      color: '#EC4899',
      route: '/utilities/calendar',
      enabled: true,
    },
    {
      name: 'Bản đồ vật liệu',
      description: 'Tìm cửa hàng vật liệu xây dựng gần bạn.',
      type: 'TOOL',
      icon: 'map-outline',
      color: '#14B8A6',
      route: '/utilities/material-map',
      enabled: true,
    },
    {
      name: 'Thông báo tiến độ',
      description: 'Nhận thông báo về tiến độ công trình, cập nhật mới nhất.',
      type: 'TOOL',
      icon: 'notifications-outline',
      color: '#0066CC',
      route: '/notifications',
      enabled: true,
    },
  ];

  const utilities = [];
  for (const data of utilitiesData) {
    const utility = await prisma.utility.upsert({
      where: { route: data.route },
      update: {},
      create: {
        ...data,
        createdBy: adminUser.id,
      },
    });
    utilities.push(utility);
    console.log(`  ✅ ${utility.name}`);
  }

  console.log(`\n✅ Created ${utilities.length} utilities`);

  // ==================== SUMMARY ====================
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log(`📦 Services: ${services.length}`);
  console.log(`🔧 Utilities: ${utilities.length}`);
  console.log(`👤 Admin User: ${adminUser.email} (ID: ${adminUser.id})`);
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
