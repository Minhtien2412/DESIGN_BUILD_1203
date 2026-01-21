/**
 * AI Consultant Service
 * Dịch vụ tư vấn AI cho các lĩnh vực xây dựng, thiết kế, nội thất
 * @author AI Assistant
 * @date 13/01/2026
 */

import { geminiService } from './api/geminiService';

// ==================== TYPES ====================

export type ConsultantType = 
  | 'house_design'      // Thiết kế nhà
  | 'interior_design'   // Thiết kế nội thất
  | 'construction'      // Xây dựng
  | 'permit'            // Giấy phép xây dựng
  | 'cost_estimate'     // Dự toán chi phí
  | 'quality'           // Giám sát chất lượng
  | 'materials'         // Vật liệu xây dựng
  | 'feng_shui'         // Phong thủy
  | 'maintenance'       // Bảo trì nhà
  | 'general';          // Tư vấn chung

export interface ConsultantConfig {
  type: ConsultantType;
  title: string;
  icon: string;
  description: string;
  systemPrompt: string;
  quickQuestions: string[];
  categories: ConsultantCategory[];
}

export interface ConsultantCategory {
  id: string;
  name: string;
  icon: string;
  questions: string[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  category?: string;
}

export interface ConsultantContext {
  projectType?: string;    // Loại công trình
  area?: number;           // Diện tích
  budget?: string;         // Ngân sách
  location?: string;       // Vị trí
  style?: string;          // Phong cách
  requirements?: string[]; // Yêu cầu đặc biệt
}

// ==================== CONSULTANT CONFIGS ====================

export const CONSULTANT_CONFIGS: Record<ConsultantType, ConsultantConfig> = {
  house_design: {
    type: 'house_design',
    title: 'Tư vấn Thiết kế Nhà',
    icon: '🏠',
    description: 'Chuyên gia AI về thiết kế kiến trúc nhà ở',
    systemPrompt: `Bạn là chuyên gia thiết kế kiến trúc nhà ở với hơn 20 năm kinh nghiệm. Bạn am hiểu về:
- Thiết kế nhà phố, biệt thự, nhà vườn, căn hộ
- Phong thủy trong thiết kế
- Quy hoạch không gian, bố trí phòng
- Kết cấu, vật liệu xây dựng
- Chi phí thiết kế và thi công
- Quy định pháp luật về xây dựng

Hãy tư vấn chi tiết, thực tế và đưa ra các gợi ý cụ thể.`,
    quickQuestions: [
      'Thiết kế nhà 2 tầng 100m2 cần bao nhiêu tiền?',
      'Nên thiết kế mấy phòng ngủ cho nhà 80m2?',
      'Hướng nhà nào tốt nhất năm 2026?',
      'Làm sao để tối ưu ánh sáng tự nhiên?',
      'Chi phí thuê kiến trúc sư là bao nhiêu?',
    ],
    categories: [
      {
        id: 'floor_plan',
        name: 'Bố trí mặt bằng',
        icon: '📐',
        questions: [
          'Cách bố trí phòng hợp lý cho nhà phố?',
          'Diện tích tối thiểu cho từng phòng là bao nhiêu?',
          'Nên đặt cầu thang ở vị trí nào?',
        ],
      },
      {
        id: 'style',
        name: 'Phong cách',
        icon: '🎨',
        questions: [
          'So sánh phong cách hiện đại và tân cổ điển?',
          'Phong cách Indochine phù hợp với nhà nào?',
          'Xu hướng thiết kế nhà năm 2026?',
        ],
      },
      {
        id: 'cost',
        name: 'Chi phí',
        icon: '💰',
        questions: [
          'Chi phí thiết kế trọn gói là bao nhiêu?',
          'Làm sao để tiết kiệm chi phí xây dựng?',
          'Nên đầu tư vào phần nào của ngôi nhà?',
        ],
      },
    ],
  },

  interior_design: {
    type: 'interior_design',
    title: 'Tư vấn Nội thất',
    icon: '🛋️',
    description: 'Chuyên gia AI về thiết kế nội thất',
    systemPrompt: `Bạn là chuyên gia thiết kế nội thất cao cấp với kiến thức sâu rộng về:
- Phong cách nội thất: Hiện đại, Cổ điển, Tối giản, Scandinavian, Industrial, Indochine
- Lựa chọn vật liệu: Gỗ, đá, kim loại, vải, da
- Phối màu và ánh sáng
- Nội thất thông minh, tiết kiệm không gian
- Xu hướng nội thất mới nhất
- Giá cả và thương hiệu nội thất

Tư vấn chi tiết về cách thiết kế, lựa chọn đồ nội thất phù hợp với ngân sách và sở thích.`,
    quickQuestions: [
      'Phong cách nội thất nào phù hợp với căn hộ nhỏ?',
      'Làm sao để phòng khách trông rộng hơn?',
      'Nên chọn sofa da hay vải?',
      'Chi phí thiết kế nội thất căn hộ 70m2?',
      'Màu sơn nào phổ biến nhất năm nay?',
    ],
    categories: [
      {
        id: 'living_room',
        name: 'Phòng khách',
        icon: '🛋️',
        questions: [
          'Cách bố trí phòng khách đẹp?',
          'Chọn sofa phù hợp với phòng 20m2?',
          'Kích thước TV phù hợp với khoảng cách ngồi?',
        ],
      },
      {
        id: 'bedroom',
        name: 'Phòng ngủ',
        icon: '🛏️',
        questions: [
          'Thiết kế phòng ngủ 12m2 như thế nào?',
          'Hướng đặt giường tốt theo phong thủy?',
          'Chọn đèn ngủ như thế nào?',
        ],
      },
      {
        id: 'kitchen',
        name: 'Bếp',
        icon: '🍳',
        questions: [
          'Thiết kế bếp chữ L hay chữ U?',
          'Chọn mặt bàn bếp bằng gì?',
          'Bếp điện từ hay bếp gas tốt hơn?',
        ],
      },
      {
        id: 'materials',
        name: 'Vật liệu',
        icon: '🪵',
        questions: [
          'So sánh gỗ tự nhiên và gỗ công nghiệp?',
          'Đá granite hay thạch anh cho bếp?',
          'Sàn gỗ hay sàn gạch tốt hơn?',
        ],
      },
    ],
  },

  permit: {
    type: 'permit',
    title: 'Tư vấn Giấy phép XD',
    icon: '📋',
    description: 'Chuyên gia AI về thủ tục pháp lý xây dựng',
    systemPrompt: `Bạn là chuyên gia pháp lý xây dựng với kiến thức sâu về:
- Luật Xây dựng 2014 và các nghị định hướng dẫn
- Thủ tục xin giấy phép xây dựng
- Hồ sơ cần thiết cho từng loại công trình
- Thời gian và chi phí xử lý
- Các trường hợp miễn giấy phép
- Xử phạt vi phạm xây dựng
- Quy định về quy hoạch, PCCC, môi trường

Tư vấn rõ ràng, cụ thể về thủ tục và hồ sơ cần thiết.`,
    quickQuestions: [
      'Xây nhà có cần xin phép không?',
      'Hồ sơ xin phép xây nhà gồm những gì?',
      'Thời gian cấp giấy phép mất bao lâu?',
      'Chi phí xin giấy phép xây dựng?',
      'Xây không phép bị phạt bao nhiêu?',
    ],
    categories: [
      {
        id: 'documents',
        name: 'Hồ sơ',
        icon: '📄',
        questions: [
          'Giấy tờ cần thiết để xin phép xây dựng?',
          'Bản vẽ thiết kế cần những gì?',
          'Giấy tờ đất cần những loại nào?',
        ],
      },
      {
        id: 'process',
        name: 'Quy trình',
        icon: '🔄',
        questions: [
          'Các bước xin giấy phép xây dựng?',
          'Nộp hồ sơ ở đâu?',
          'Cách theo dõi tiến độ hồ sơ?',
        ],
      },
      {
        id: 'regulations',
        name: 'Quy định',
        icon: '⚖️',
        questions: [
          'Nhà mấy tầng cần xin phép?',
          'Khoảng lùi tối thiểu là bao nhiêu?',
          'Mật độ xây dựng tối đa cho phép?',
        ],
      },
    ],
  },

  cost_estimate: {
    type: 'cost_estimate',
    title: 'Tư vấn Dự toán',
    icon: '💰',
    description: 'Chuyên gia AI về chi phí xây dựng',
    systemPrompt: `Bạn là chuyên gia dự toán xây dựng với kiến thức về:
- Chi phí xây dựng phần thô và hoàn thiện
- Giá vật liệu xây dựng (xi măng, sắt thép, gạch, cát, đá...)
- Giá nhân công theo vùng miền
- Chi phí thiết kế, giám sát
- Các khoản phát sinh thường gặp
- Cách tối ưu chi phí xây dựng
- Phương thức thanh toán theo giai đoạn

Đưa ra các con số cụ thể, cập nhật theo thị trường năm 2026.`,
    quickQuestions: [
      'Xây nhà 2 tầng 100m2 hết bao nhiêu?',
      'Chi phí xây thô và hoàn thiện?',
      'Giá sắt thép, xi măng hiện tại?',
      'Nên xây trọn gói hay tự quản lý?',
      'Làm sao để tránh phát sinh chi phí?',
    ],
    categories: [
      {
        id: 'raw_cost',
        name: 'Chi phí thô',
        icon: '🧱',
        questions: [
          'Chi phí xây thô 1m2 là bao nhiêu?',
          'Giá móng nhà trung bình?',
          'Chi phí đổ mái bê tông?',
        ],
      },
      {
        id: 'finish_cost',
        name: 'Hoàn thiện',
        icon: '✨',
        questions: [
          'Chi phí hoàn thiện cơ bản vs cao cấp?',
          'Giá sơn nhà trọn gói?',
          'Chi phí lắp đặt điện nước?',
        ],
      },
      {
        id: 'materials_price',
        name: 'Giá vật liệu',
        icon: '📦',
        questions: [
          'Giá các loại gạch xây hiện nay?',
          'So sánh giá cửa nhôm và cửa gỗ?',
          'Giá các loại sơn phổ biến?',
        ],
      },
    ],
  },

  quality: {
    type: 'quality',
    title: 'Tư vấn Giám sát CL',
    icon: '✅',
    description: 'Chuyên gia AI về kiểm tra chất lượng công trình',
    systemPrompt: `Bạn là kỹ sư giám sát xây dựng với kinh nghiệm về:
- Tiêu chuẩn chất lượng công trình
- Kiểm tra vật liệu đầu vào
- Giám sát thi công từng hạng mục
- Nghiệm thu công trình
- Các lỗi thường gặp và cách phòng tránh
- Quy trình bảo hành công trình

Tư vấn cách kiểm tra chất lượng và phát hiện lỗi thi công.`,
    quickQuestions: [
      'Làm sao kiểm tra chất lượng bê tông?',
      'Dấu hiệu nhà bị nứt do móng?',
      'Cách kiểm tra thợ thi công đúng kỹ thuật?',
      'Khi nào cần nghiệm thu các hạng mục?',
      'Thời gian bảo hành nhà mới là bao lâu?',
    ],
    categories: [
      {
        id: 'foundation',
        name: 'Móng',
        icon: '🏗️',
        questions: [
          'Cách kiểm tra móng đạt chuẩn?',
          'Dấu hiệu móng bị lún?',
          'Thời gian đổ móng cần bao lâu?',
        ],
      },
      {
        id: 'structure',
        name: 'Kết cấu',
        icon: '🔩',
        questions: [
          'Kiểm tra cốt thép như thế nào?',
          'Độ dày sàn bê tông tiêu chuẩn?',
          'Cách kiểm tra tường xây?',
        ],
      },
      {
        id: 'finish',
        name: 'Hoàn thiện',
        icon: '🎨',
        questions: [
          'Kiểm tra trát tường, ốp lát?',
          'Lỗi thường gặp khi sơn nhà?',
          'Nghiệm thu điện nước thế nào?',
        ],
      },
    ],
  },

  materials: {
    type: 'materials',
    title: 'Tư vấn Vật liệu',
    icon: '🧱',
    description: 'Chuyên gia AI về vật liệu xây dựng',
    systemPrompt: `Bạn là chuyên gia vật liệu xây dựng với kiến thức về:
- Các loại xi măng, sắt thép, gạch, cát, đá
- Vật liệu hoàn thiện: gạch ốp lát, sơn, cửa
- So sánh chất lượng và giá cả các thương hiệu
- Cách chọn vật liệu phù hợp với công trình
- Phát hiện hàng giả, hàng kém chất lượng
- Nguồn cung cấp uy tín

Tư vấn cách chọn vật liệu chất lượng, giá cả hợp lý.`,
    quickQuestions: [
      'Xi măng nào tốt nhất hiện nay?',
      'Cách phân biệt sắt thép thật giả?',
      'So sánh gạch Prime và Viglacera?',
      'Nên chọn sơn Dulux hay Jotun?',
      'Mua vật liệu ở đâu uy tín?',
    ],
    categories: [
      {
        id: 'basic',
        name: 'Vật liệu thô',
        icon: '🏗️',
        questions: [
          'Các loại xi măng phổ biến?',
          'Cách chọn sắt thép chất lượng?',
          'Gạch xây loại nào tốt?',
        ],
      },
      {
        id: 'tiles',
        name: 'Gạch ốp lát',
        icon: '🔲',
        questions: [
          'So sánh gạch men và gạch granite?',
          'Kích thước gạch phù hợp với từng phòng?',
          'Cách tính số lượng gạch cần mua?',
        ],
      },
      {
        id: 'paint',
        name: 'Sơn',
        icon: '🎨',
        questions: [
          'Các loại sơn nước phổ biến?',
          'Sơn chống thấm loại nào tốt?',
          'Cách tính lượng sơn cần dùng?',
        ],
      },
    ],
  },

  construction: {
    type: 'construction',
    title: 'Tư vấn Xây dựng',
    icon: '🏗️',
    description: 'Chuyên gia AI về thi công xây dựng',
    systemPrompt: `Bạn là chuyên gia xây dựng với kinh nghiệm thi công nhiều năm:
- Quy trình thi công từng hạng mục
- Kỹ thuật xây dựng chuẩn
- Quản lý dự án xây dựng
- Chọn nhà thầu, thợ thi công
- Xử lý sự cố công trình
- Tiến độ thi công hợp lý

Tư vấn về kỹ thuật và quản lý thi công công trình.`,
    quickQuestions: [
      'Xây nhà mất bao lâu?',
      'Nên thuê thợ lẻ hay nhà thầu?',
      'Mùa nào xây nhà tốt nhất?',
      'Cách kiểm soát tiến độ thi công?',
      'Làm sao tránh tranh chấp với nhà thầu?',
    ],
    categories: [
      {
        id: 'process',
        name: 'Quy trình',
        icon: '📋',
        questions: [
          'Các bước thi công nhà từ đầu đến cuối?',
          'Tiến độ thi công hợp lý cho nhà 3 tầng?',
          'Chuẩn bị gì trước khi khởi công?',
        ],
      },
      {
        id: 'contractor',
        name: 'Nhà thầu',
        icon: '👷',
        questions: [
          'Cách chọn nhà thầu uy tín?',
          'Nội dung hợp đồng xây dựng?',
          'Thanh toán theo tiến độ như thế nào?',
        ],
      },
      {
        id: 'issues',
        name: 'Sự cố',
        icon: '⚠️',
        questions: [
          'Xử lý khi công trình chậm tiến độ?',
          'Công trình bị thấm dột phải làm sao?',
          'Giải quyết tranh chấp với nhà thầu?',
        ],
      },
    ],
  },

  feng_shui: {
    type: 'feng_shui',
    title: 'Tư vấn Phong thủy',
    icon: '☯️',
    description: 'Chuyên gia AI về phong thủy nhà ở',
    systemPrompt: `Bạn là chuyên gia phong thủy Việt Nam với kiến thức sâu về:
- Bát trạch, Huyền không phi tinh
- Ngũ hành tương sinh tương khắc
- Xem tuổi, xem hướng nhà
- Bố trí nội thất theo phong thủy
- Vật phẩm phong thủy, hóa giải

Tư vấn phong thủy chi tiết, dễ hiểu và thực tế.`,
    quickQuestions: [
      'Hướng nhà nào tốt cho tuổi tôi?',
      'Cách bố trí bàn thờ đúng phong thủy?',
      'Cây phong thủy nào phù hợp với mệnh tôi?',
      'Làm sao hóa giải hướng nhà xấu?',
      'Màu sơn nhà nào tốt cho năm 2026?',
    ],
    categories: [],
  },

  maintenance: {
    type: 'maintenance',
    title: 'Tư vấn Bảo trì',
    icon: '🔧',
    description: 'Chuyên gia AI về bảo trì nhà cửa',
    systemPrompt: `Bạn là chuyên gia bảo trì và sửa chữa nhà với kinh nghiệm về:
- Bảo trì định kỳ các hạng mục trong nhà
- Sửa chữa điện, nước, điện lạnh
- Xử lý thấm dột, nứt tường
- Bảo dưỡng nội thất
- Chi phí và lịch bảo trì

Tư vấn cách bảo trì và sửa chữa nhà hiệu quả.`,
    quickQuestions: [
      'Lịch bảo trì nhà hàng năm?',
      'Chi phí sơn lại nhà là bao nhiêu?',
      'Cách xử lý tường bị ẩm mốc?',
      'Khi nào cần thay bình nóng lạnh?',
      'Cách bảo dưỡng sàn gỗ?',
    ],
    categories: [
      {
        id: 'electrical',
        name: 'Điện',
        icon: '⚡',
        questions: [
          'Lịch kiểm tra hệ thống điện?',
          'Dấu hiệu cần sửa điện?',
          'Chi phí thay dây điện toàn bộ?',
        ],
      },
      {
        id: 'plumbing',
        name: 'Nước',
        icon: '🚿',
        questions: [
          'Cách phát hiện rò rỉ nước?',
          'Bảo trì bồn cầu, lavabo?',
          'Xử lý ống nước bị tắc?',
        ],
      },
      {
        id: 'exterior',
        name: 'Ngoại thất',
        icon: '🏠',
        questions: [
          'Khi nào cần sơn lại nhà?',
          'Xử lý tường bị rạn nứt?',
          'Bảo trì mái ngói, mái tôn?',
        ],
      },
    ],
  },

  general: {
    type: 'general',
    title: 'Tư vấn chung',
    icon: '💬',
    description: 'Hỗ trợ tư vấn mọi vấn đề về nhà ở',
    systemPrompt: `Bạn là trợ lý AI hỗ trợ tư vấn về nhà ở và xây dựng. Bạn có kiến thức tổng hợp về:
- Thiết kế kiến trúc và nội thất
- Thi công xây dựng
- Vật liệu và chi phí
- Pháp lý xây dựng
- Phong thủy
- Bảo trì nhà cửa

Trả lời mọi câu hỏi liên quan đến nhà ở một cách chi tiết và hữu ích.`,
    quickQuestions: [
      'Tôi muốn xây nhà, bắt đầu từ đâu?',
      'Chi phí xây nhà 3 tầng là bao nhiêu?',
      'Nên thuê kiến trúc sư hay dùng bản vẽ có sẵn?',
      'Làm sao để có căn nhà đẹp mà tiết kiệm?',
    ],
    categories: [],
  },
};

// ==================== MOCK RESPONSES ====================

const MOCK_RESPONSES: Record<string, string> = {
  // House Design
  'thiết kế nhà': '🏠 **Về thiết kế nhà:**\n\nĐể thiết kế ngôi nhà phù hợp, bạn cần xác định:\n\n1️⃣ **Diện tích đất**: Chiều rộng x chiều dài\n2️⃣ **Số tầng**: Dựa vào nhu cầu sử dụng\n3️⃣ **Số phòng**: Phòng ngủ, WC, bếp...\n4️⃣ **Ngân sách**: Phần thô + hoàn thiện\n5️⃣ **Phong cách**: Hiện đại, cổ điển, tối giản...\n\n💡 **Chi phí thiết kế tham khảo:**\n• Kiến trúc: 80.000 - 150.000đ/m² sàn\n• Nội thất: 50.000 - 100.000đ/m² sàn\n\nBạn muốn tư vấn cụ thể hơn về phần nào?',

  'chi phí xây': '💰 **Chi phí xây dựng năm 2026:**\n\n📊 **Đơn giá tham khảo:**\n• Phần thô: 4.5 - 6 triệu/m² sàn\n• Hoàn thiện cơ bản: 6 - 8 triệu/m² sàn\n• Hoàn thiện cao cấp: 8 - 12 triệu/m² sàn\n\n🏠 **Ví dụ nhà 2 tầng 100m² (200m² sàn):**\n• Phần thô: 900 triệu - 1.2 tỷ\n• Hoàn thiện: 1.2 - 2.4 tỷ\n\n⚠️ Lưu ý: Giá có thể thay đổi theo khu vực và thời điểm.',

  'nội thất': '🛋️ **Về thiết kế nội thất:**\n\n**Các phong cách phổ biến:**\n• 🏢 Hiện đại (Modern): Đường nét đơn giản, tông màu trung tính\n• 🏛️ Tân cổ điển (Neoclassic): Sang trọng, chi tiết trang trí\n• 🪵 Tối giản (Minimalist): Ít đồ đạc, không gian thoáng\n• 🌿 Scandinavian: Gỗ sáng, màu pastel, ấm cúng\n\n💰 **Chi phí tham khảo:**\n• Cơ bản: 100 - 200 triệu/căn hộ\n• Trung cấp: 200 - 400 triệu\n• Cao cấp: 400 triệu - 1 tỷ+',

  'giấy phép': '📋 **Thủ tục xin giấy phép xây dựng:**\n\n📂 **Hồ sơ cần thiết:**\n1. Đơn xin cấp giấy phép xây dựng\n2. Giấy tờ về quyền sử dụng đất\n3. Bản vẽ thiết kế (2 bộ)\n4. Bản cam kết PCCC, môi trường\n\n⏱️ **Thời gian xử lý:**\n• Nhà ở riêng lẻ: 15-20 ngày\n• Công trình khác: 20-30 ngày\n\n💵 **Phí cấp giấy phép:** 50.000 - 500.000đ\n\n⚠️ **Xây không phép:** Phạt 50-100 triệu đồng!',

  'phong thủy': '☯️ **Tư vấn phong thủy:**\n\nĐể tư vấn chính xác, tôi cần biết:\n• Năm sinh của gia chủ\n• Giới tính\n• Hướng nhà dự kiến\n\n🧭 **Nguyên tắc chung:**\n• Cửa chính hướng Sinh khí\n• Bếp đặt hướng xấu để hóa giải\n• Phòng ngủ hướng Thiên y hoặc Diên niên\n\n🎨 **Màu sắc theo mệnh:**\n• Kim: Trắng, vàng, nâu\n• Mộc: Xanh lá, đen\n• Thủy: Đen, xanh dương\n• Hỏa: Đỏ, cam, tím\n• Thổ: Vàng, nâu, be',

  'vật liệu': '🧱 **Tư vấn vật liệu xây dựng:**\n\n**Xi măng phổ biến:**\n• Holcim, INSEE: Chất lượng cao\n• Nghi Sơn, Bỉm Sơn: Phổ thông\n\n**Sắt thép:**\n• Hòa Phát, Pomina: Uy tín nhất\n• Giá: 15.000 - 18.000đ/kg\n\n**Gạch xây:**\n• Gạch đặc: 1.500 - 2.000đ/viên\n• Gạch ống: 800 - 1.200đ/viên\n\n💡 Mua tại đại lý chính hãng để tránh hàng giả!',

  'default': '👋 **Xin chào!**\n\nTôi là trợ lý AI tư vấn về xây dựng và nhà ở. Tôi có thể giúp bạn về:\n\n🏠 Thiết kế kiến trúc\n🛋️ Thiết kế nội thất\n💰 Dự toán chi phí\n📋 Thủ tục giấy phép\n☯️ Phong thủy\n🧱 Vật liệu xây dựng\n✅ Giám sát chất lượng\n🔧 Bảo trì nhà cửa\n\nBạn cần tư vấn về vấn đề gì?',
};

function findMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  for (const [keyword, response] of Object.entries(MOCK_RESPONSES)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }
  
  return MOCK_RESPONSES['default'];
}

// ==================== MAIN SERVICE ====================

/**
 * Gửi tin nhắn đến AI Consultant
 */
export async function sendConsultMessage(
  message: string,
  consultantType: ConsultantType,
  context?: ConsultantContext
): Promise<string> {
  const config = CONSULTANT_CONFIGS[consultantType];
  
  // Build context string
  let contextStr = '';
  if (context) {
    const parts: string[] = [];
    if (context.projectType) parts.push(`Loại công trình: ${context.projectType}`);
    if (context.area) parts.push(`Diện tích: ${context.area}m²`);
    if (context.budget) parts.push(`Ngân sách: ${context.budget}`);
    if (context.location) parts.push(`Vị trí: ${context.location}`);
    if (context.style) parts.push(`Phong cách: ${context.style}`);
    if (context.requirements?.length) parts.push(`Yêu cầu: ${context.requirements.join(', ')}`);
    
    if (parts.length > 0) {
      contextStr = `[Thông tin dự án: ${parts.join(' | ')}]\n\n`;
    }
  }
  
  const fullPrompt = `${contextStr}${message}`;
  
  try {
    // Try using Gemini service
    const response = await geminiService.sendMessage(
      `[${config.title}] ${fullPrompt}`,
      []
    );
    return response.text;
  } catch (error) {
    console.error('AI consultation error:', error);
    // Fallback to mock response
    return findMockResponse(message);
  }
}

/**
 * Lấy config cho loại consultant
 */
export function getConsultantConfig(type: ConsultantType): ConsultantConfig {
  return CONSULTANT_CONFIGS[type];
}

/**
 * Lấy tất cả các loại consultant
 */
export function getAllConsultantTypes(): ConsultantType[] {
  return Object.keys(CONSULTANT_CONFIGS) as ConsultantType[];
}

// Export default
export default {
  sendMessage: sendConsultMessage,
  getConfig: getConsultantConfig,
  getAllTypes: getAllConsultantTypes,
  configs: CONSULTANT_CONFIGS,
};
