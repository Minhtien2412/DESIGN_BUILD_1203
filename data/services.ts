/**
 * Services Data
 * 17 construction & home services
 */

export interface Service {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string; // Emoji or icon name
  image?: any; // require() for local images
  category: 'construction' | 'labor' | 'material' | 'finishing' | 'tech';
  pricing: PricingItem[];
  features: string[];
  unit: string;
  minOrder?: number;
  deliveryTime?: string;
}

export interface PricingItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  priceNote?: string;
}

export const SERVICES: Service[] = [
  {
    id: '1',
    slug: 'ep-coc',
    name: 'Ép Cọc',
    nameEn: 'Pile Driving',
    description: 'Dịch vụ ép cọc chuyên nghiệp với thiết bị hiện đại, đảm bảo nền móng vững chắc cho công trình. Đội ngũ kỹ thuật viên giàu kinh nghiệm, thi công nhanh chóng và an toàn.',
    icon: '🏗️',
    category: 'construction',
    unit: 'cây',
    pricing: [
      {
        id: '1',
        name: 'Cọc D300',
        description: 'Cọc bê tông ly tâm đường kính 300mm',
        price: 800000,
        unit: 'cây',
        priceNote: 'Chưa bao gồm vận chuyển'
      },
      {
        id: '2',
        name: 'Cọc D350',
        description: 'Cọc bê tông ly tâm đường kính 350mm',
        price: 1000000,
        unit: 'cây',
        priceNote: 'Chưa bao gồm vận chuyển'
      },
      {
        id: '3',
        name: 'Cọc D400',
        description: 'Cọc bê tông ly tâm đường kính 400mm',
        price: 1200000,
        unit: 'cây',
        priceNote: 'Chưa bao gồm vận chuyển'
      }
    ],
    features: [
      'Thiết bị ép cọc hiện đại, công suất lớn',
      'Đội ngũ kỹ thuật viên có chứng chỉ',
      'Bảo hành móng 5 năm',
      'Thi công nhanh, đúng tiến độ',
      'Kiểm định chất lượng sau thi công',
      'Hỗ trợ tư vấn thiết kế móng'
    ],
    deliveryTime: '7-14 ngày'
  },
  {
    id: '2',
    slug: 'dao-dat',
    name: 'Đào Đất',
    nameEn: 'Excavation',
    description: 'Dịch vụ đào đất móng, đào hố thiết, san lấp mặt bằng với máy móc hiện đại. Thi công nhanh, chính xác theo bản vẽ thiết kế.',
    icon: '🚜',
    category: 'construction',
    unit: 'm³',
    pricing: [
      {
        id: '1',
        name: 'Đào đất thủ công',
        description: 'Phù hợp khu vực hẹp, máy móc không vào được',
        price: 150000,
        unit: 'm³'
      },
      {
        id: '2',
        name: 'Đào bằng máy',
        description: 'Thi công nhanh, khối lượng lớn',
        price: 80000,
        unit: 'm³'
      },
      {
        id: '3',
        name: 'San lấp mặt bằng',
        description: 'Bao gồm vận chuyển đất đắp',
        price: 120000,
        unit: 'm³'
      }
    ],
    features: [
      'Máy xúc đào Hitachi, Komatsu',
      'Đo đạc chính xác bằng GPS',
      'Thu gom và vận chuyển đất thải',
      'Thi công cả ngày và đêm',
      'Bảo hiểm trách nhiệm dân sự'
    ],
    deliveryTime: '3-7 ngày'
  },
  {
    id: '3',
    slug: 'vat-lieu',
    name: 'Vật Liệu Xây Dựng',
    nameEn: 'Building Materials',
    description: 'Cung cấp đầy đủ vật liệu xây dựng chất lượng cao: xi măng, cát, sỏi, gạch, thép... Giá cạnh tranh, giao hàng tận nơi.',
    icon: '🧱',
    category: 'material',
    unit: 'combo',
    pricing: [
      {
        id: '1',
        name: 'Xi măng PCB40',
        price: 95000,
        unit: 'bao',
        description: '50kg/bao'
      },
      {
        id: '2',
        name: 'Cát xây dựng',
        price: 350000,
        unit: 'm³'
      },
      {
        id: '3',
        name: 'Sỏi 1x2',
        price: 450000,
        unit: 'm³'
      },
      {
        id: '4',
        name: 'Gạch block',
        price: 1800,
        unit: 'viên',
        description: '10x20x60cm'
      },
      {
        id: '5',
        name: 'Thép phi 10',
        price: 14500,
        unit: 'kg'
      }
    ],
    features: [
      'Vật liệu đạt chuẩn chất lượng',
      'Nguồn gốc rõ ràng, có CO/CQ',
      'Giao hàng tận nơi miễn phí (>5 triệu)',
      'Tư vấn định lượng vật liệu',
      'Thanh toán linh hoạt',
      'Đổi trả trong 7 ngày'
    ],
    deliveryTime: '1-3 ngày'
  },
  {
    id: '4',
    slug: 'be-tong',
    name: 'Bê Tông Thương Phẩm',
    nameEn: 'Ready-Mix Concrete',
    description: 'Cung cấp bê tông thương phẩm các mác M100 - M400, đảm bảo chất lượng ổn định. Đội xe chuyên dụng giao hàng đúng giờ.',
    icon: '🚛',
    category: 'material',
    unit: 'm³',
    pricing: [
      {
        id: '1',
        name: 'Bê tông M100',
        description: 'Làm lót móng, đường nội bộ',
        price: 1200000,
        unit: 'm³'
      },
      {
        id: '2',
        name: 'Bê tông M150',
        description: 'Móng băng, móng đơn',
        price: 1350000,
        unit: 'm³'
      },
      {
        id: '3',
        name: 'Bê tông M200',
        description: 'Sàn, dầm, cột thông thường',
        price: 1500000,
        unit: 'm³'
      },
      {
        id: '4',
        name: 'Bê tông M250',
        description: 'Cột, dầm công trình cao tầng',
        price: 1650000,
        unit: 'm³'
      }
    ],
    features: [
      'Trạm trộn tự động, chuẩn ISO',
      'Kiểm định mẫu theo TCVN',
      'Xe bơm bê tông hiện đại',
      'Giao hàng 24/7',
      'Cam kết đúng mác, đúng giờ',
      'Hỗ trợ kỹ thuật thi công'
    ],
    minOrder: 3,
    deliveryTime: 'Same day'
  },
  {
    id: '5',
    slug: 'nhan-cong',
    name: 'Nhân Công Phổ Thông',
    nameEn: 'General Labor',
    description: 'Cung ứng nhân công phổ thông cho công trình: khuân vác, đào đắp, dọn dẹp... Làm việc chăm chỉ, có trách nhiệm.',
    icon: '👷',
    category: 'labor',
    unit: 'công',
    pricing: [
      {
        id: '1',
        name: 'Công nhân phổ thông',
        description: 'Khuân vác, dọn dẹp, phụ việc',
        price: 350000,
        unit: 'công/ngày'
      },
      {
        id: '2',
        name: 'Công nhân có kinh nghiệm',
        description: 'Phụ thợ xây, thợ sắt',
        price: 450000,
        unit: 'công/ngày'
      }
    ],
    features: [
      'Nhân công đủ điều kiện pháp lý',
      'Làm việc có kỷ luật, nghiêm túc',
      'Bảo hiểm tai nạn lao động',
      'Thay thế nếu vắng mặt',
      'Linh hoạt số lượng theo nhu cầu',
      'Giám sát tại công trình'
    ],
    deliveryTime: '1-2 ngày'
  },
  {
    id: '6',
    slug: 'tho-xay',
    name: 'Thợ Xây',
    nameEn: 'Mason',
    description: 'Đội ngũ thợ xây chuyên nghiệp, thi công móng, tường, cột dầm... Tay nghề cao, đảm bảo chất lượng và tiến độ.',
    icon: '🔨',
    category: 'labor',
    unit: 'công',
    pricing: [
      {
        id: '1',
        name: 'Xây tường gạch',
        description: 'Gạch block, gạch đỏ',
        price: 550000,
        unit: 'công/ngày'
      },
      {
        id: '2',
        name: 'Đổ bê tông',
        description: 'Móng, cột, dầm, sàn',
        price: 600000,
        unit: 'công/ngày'
      },
      {
        id: '3',
        name: 'Trát tường',
        description: 'Trát trong, ngoài',
        price: 500000,
        unit: 'công/ngày'
      }
    ],
    features: [
      'Kinh nghiệm 5-10 năm',
      'Thi công theo bản vẽ kỹ thuật',
      'Đảm bảo độ vuông góc, thẳng đứng',
      'Sử dụng dụng cụ đo chuyên nghiệp',
      'Bảo hành công trình 12 tháng',
      'Làm thêm giờ nếu cần thiết'
    ],
    deliveryTime: 'Same day'
  },
  {
    id: '7',
    slug: 'tho-sat',
    name: 'Thợ Sắt',
    nameEn: 'Steel Worker',
    description: 'Chuyên gia đột, uốn, buộc thép móng, cột, dầm, sàn. Đọc được bản vẽ kết cấu, thi công chính xác.',
    icon: '🔧',
    category: 'labor',
    unit: 'công',
    pricing: [
      {
        id: '1',
        name: 'Thi công thép móng',
        price: 580000,
        unit: 'công/ngày'
      },
      {
        id: '2',
        name: 'Thi công thép cột, dầm',
        price: 620000,
        unit: 'công/ngày'
      },
      {
        id: '3',
        name: 'Thi công thép sàn',
        price: 600000,
        unit: 'công/ngày'
      }
    ],
    features: [
      'Đọc và thi công theo bản vẽ kết cấu',
      'Đúng quy cách thép, khoảng cách',
      'Buộc thép chắc chắn, đúng kỹ thuật',
      'Kiểm tra chất lượng trước đổ bê tông',
      'Đội thợ 2-3 người làm việc nhóm',
      'Có bảo hiểm tai nạn lao động'
    ],
    deliveryTime: 'Same day'
  },
  {
    id: '8',
    slug: 'tho-coffa',
    name: 'Thợ Ván Khuôn (Coffa)',
    nameEn: 'Formwork Carpenter',
    description: 'Thi công ván khuôn chuyên nghiệp cho cột, dầm, sàn. Đảm bảo kích thước chính xác, bề mặt bê tông đẹp.',
    icon: '🪵',
    category: 'labor',
    unit: 'công',
    pricing: [
      {
        id: '1',
        name: 'Lắp ván khuôn cột',
        price: 550000,
        unit: 'công/ngày'
      },
      {
        id: '2',
        name: 'Lắp ván khuôn dầm',
        price: 570000,
        unit: 'công/ngày'
      },
      {
        id: '3',
        name: 'Lắp ván khuôn sàn',
        price: 580000,
        unit: 'công/ngày'
      },
      {
        id: '4',
        name: 'Tháo dỡ ván khuôn',
        price: 400000,
        unit: 'công/ngày'
      }
    ],
    features: [
      'Chuyên lắp ván khuôn kim loại',
      'Đảm bảo kích thước theo bản vẽ',
      'Chống đỡ chắc chắn, an toàn',
      'Tháo dỡ đúng thời gian dưỡng hộ',
      'Bảo quản ván khuôn tái sử dụng',
      'Làm việc nhóm 2-3 người'
    ],
    deliveryTime: 'Same day'
  },
  {
    id: '9',
    slug: 'tho-co-khi',
    name: 'Thợ Cơ Khí',
    nameEn: 'Mechanical Engineer',
    description: 'Lắp đặt hệ thống cơ khí: thang máy, máy phát điện, máy bơm nước... Bảo dưỡng và sửa chữa chuyên nghiệp.',
    icon: '⚙️',
    category: 'tech',
    unit: 'công',
    pricing: [
      {
        id: '1',
        name: 'Lắp đặt máy bơm nước',
        price: 800000,
        unit: 'công/ngày'
      },
      {
        id: '2',
        name: 'Lắp đặt máy phát điện',
        price: 1200000,
        unit: 'công/ngày'
      },
      {
        id: '3',
        name: 'Sửa chữa, bảo dưỡng',
        price: 700000,
        unit: 'công/ngày'
      }
    ],
    features: [
      'Có chứng chỉ hành nghề',
      'Kinh nghiệm với nhiều loại thiết bị',
      'Đầy đủ dụng cụ chuyên dụng',
      'Tư vấn lựa chọn thiết bị',
      'Bảo hành công trình 12 tháng',
      'Hỗ trợ khẩn cấp 24/7'
    ],
    deliveryTime: '1-2 ngày'
  },
  {
    id: '10',
    slug: 'tho-to-tuong',
    name: 'Thợ Tô Tường',
    nameEn: 'Plasterer',
    description: 'Trát tường trong, ngoài, trát trần, láng bóng. Bề mặt phẳng, mịn, không nứt, sẵn sàng cho công đoạn sơn.',
    icon: '🪛',
    category: 'finishing',
    unit: 'm²',
    pricing: [
      {
        id: '1',
        name: 'Trát tường thô',
        price: 35000,
        unit: 'm²'
      },
      {
        id: '2',
        name: 'Trát tường láng bóng',
        price: 50000,
        unit: 'm²'
      },
      {
        id: '3',
        name: 'Trát trần',
        price: 55000,
        unit: 'm²'
      }
    ],
    features: [
      'Bề mặt phẳng, không sóng, không nứt',
      'Góc tường vuông vắn, cạnh thẳng',
      'Vữa trộn đúng tỷ lệ, đủ độ bám dính',
      'Dưỡng hộ sau trát để không nứt',
      'Bảo hành 12 tháng',
      'Thi công nhanh, sạch sẽ'
    ],
    deliveryTime: 'Same day'
  },
  {
    id: '11',
    slug: 'tho-dien-nuoc',
    name: 'Thợ Điện Nước',
    nameEn: 'Electrician & Plumber',
    description: 'Thi công hệ thống điện, nước trong nhà. Đi âm tường, lắp đặt thiết bị điện, thiết bị vệ sinh. An toàn, đúng tiêu chuẩn.',
    icon: '💡',
    category: 'tech',
    unit: 'công',
    pricing: [
      {
        id: '1',
        name: 'Thi công điện',
        description: 'Đi âm tường, lắp đặt thiết bị',
        price: 650000,
        unit: 'công/ngày'
      },
      {
        id: '2',
        name: 'Thi công nước',
        description: 'Đường ống, thiết bị vệ sinh',
        price: 600000,
        unit: 'công/ngày'
      },
      {
        id: '3',
        name: 'Sửa chữa, bảo dưỡng',
        price: 500000,
        unit: 'công/ngày'
      }
    ],
    features: [
      'Có chứng chỉ thợ điện, thợ nước',
      'Thi công theo QCVN, TCVN',
      'Kiểm tra an toàn điện',
      'Thử áp đường ống nước',
      'Bảo hành 24 tháng',
      'Hỗ trợ khẩn cấp 24/7'
    ],
    deliveryTime: 'Same day'
  },
  {
    id: '12',
    slug: 'lat-gach',
    name: 'Lát Gạch',
    nameEn: 'Tile Installation',
    description: 'Thi công lát gạch nền, gạch ốp tường. Các loại gạch men, gạch đá, gạch giả gỗ... Mạch gạch thẳng, đều, đẹp.',
    icon: '🟦',
    category: 'finishing',
    unit: 'm²',
    pricing: [
      {
        id: '1',
        name: 'Lát gạch nền 40x40',
        price: 85000,
        unit: 'm²'
      },
      {
        id: '2',
        name: 'Lát gạch nền 60x60',
        price: 95000,
        unit: 'm²'
      },
      {
        id: '3',
        name: 'Lát gạch nền 80x80',
        price: 110000,
        unit: 'm²'
      },
      {
        id: '4',
        name: 'Ốp gạch tường',
        price: 95000,
        unit: 'm²'
      }
    ],
    features: [
      'Mạch gạch thẳng, đều, đẹp',
      'Ron gạch đồng đều (1-2mm)',
      'Không bị vênh, rỗng dưới gạch',
      'Vệ sinh sạch sẽ sau thi công',
      'Bảo hành 12 tháng',
      'Tư vấn chọn gạch phù hợp'
    ],
    deliveryTime: 'Same day'
  },
  {
    id: '13',
    slug: 'thach-cao',
    name: 'Thạch Cao',
    nameEn: 'Gypsum Board',
    description: 'Thi công trần thạch cao, vách ngăn thạch cao. Kiểu dáng hiện đại, bề mặt phẳng, mịn, sẵn sàng sơn.',
    icon: '📐',
    category: 'finishing',
    unit: 'm²',
    pricing: [
      {
        id: '1',
        name: 'Trần thạch cao phẳng',
        price: 130000,
        unit: 'm²'
      },
      {
        id: '2',
        name: 'Trần thạch cao giật cấp',
        price: 180000,
        unit: 'm²'
      },
      {
        id: '3',
        name: 'Vách ngăn thạch cao',
        price: 150000,
        unit: 'm²'
      }
    ],
    features: [
      'Khung xương chắc chắn, đúng kỹ thuật',
      'Tấm thạch cao chống ẩm, chống cháy',
      'Bề mặt phẳng, mịn, không nứt',
      'Tích hợp đèn LED, đèn âm trần',
      'Cách âm, cách nhiệt tốt',
      'Bảo hành 24 tháng'
    ],
    deliveryTime: '1-2 ngày'
  },
  {
    id: '14',
    slug: 'tho-son',
    name: 'Thợ Sơn',
    nameEn: 'Painter',
    description: 'Sơn nhà trong, ngoài. Sơn tường, trần, cửa, lan can... Bề mặt đẹp, màu đều, không lem, không chảy.',
    icon: '🎨',
    category: 'finishing',
    unit: 'm²',
    pricing: [
      {
        id: '1',
        name: 'Sơn nước nội thất',
        description: '2 lớp sơn lót + 2 lớp sơn phủ',
        price: 45000,
        unit: 'm²'
      },
      {
        id: '2',
        name: 'Sơn nước ngoại thất',
        description: '2 lớp sơn lót + 2 lớp sơn phủ',
        price: 55000,
        unit: 'm²'
      },
      {
        id: '3',
        name: 'Sơn dầu (cửa, lan can)',
        price: 85000,
        unit: 'm²'
      }
    ],
    features: [
      'Sơn các hãng nổi tiếng (Dulux, Kova...)',
      'Màu sắc đều, không lem, không chảy',
      'Bóc bỏ lớp sơn cũ (nếu cần)',
      'Bả matit kín các vết nứt',
      'Bảo vệ đồ đạc, vệ sinh sau thi công',
      'Bảo hành 12 tháng'
    ],
    deliveryTime: 'Same day'
  },
  {
    id: '15',
    slug: 'tho-da',
    name: 'Thợ Đá',
    nameEn: 'Stone Mason',
    description: 'Thi công đá ốp tường, đá lát nền, đá cầu thang. Các loại đá tự nhiên, đá nhân tạo. Bề mặt bóng đẹp.',
    icon: '🪨',
    category: 'finishing',
    unit: 'm²',
    pricing: [
      {
        id: '1',
        name: 'Lát đá granite',
        price: 350000,
        unit: 'm²',
        priceNote: 'Chưa bao gồm vật liệu'
      },
      {
        id: '2',
        name: 'Lát đá marble',
        price: 380000,
        unit: 'm²',
        priceNote: 'Chưa bao gồm vật liệu'
      },
      {
        id: '3',
        name: 'Ốp đá tường',
        price: 400000,
        unit: 'm²',
        priceNote: 'Chưa bao gồm vật liệu'
      }
    ],
    features: [
      'Cắt đá chính xác, mép đều',
      'Mạch đá đẹp, đối xứng',
      'Đánh bóng bề mặt sáng như gương',
      'Ron đá mỏng, đồng đều',
      'Không bị rỗng, bong tróc',
      'Bảo hành 24 tháng'
    ],
    deliveryTime: '2-3 ngày'
  },
  {
    id: '16',
    slug: 'lam-cua',
    name: 'Làm Cửa',
    nameEn: 'Door & Window Installation',
    description: 'Thi công cửa nhôm kính, cửa gỗ, cửa sắt. Đo đạc, gia công, lắp đặt chuyên nghiệp. Đóng mở êm, kín khít.',
    icon: '🚪',
    category: 'finishing',
    unit: 'm²',
    pricing: [
      {
        id: '1',
        name: 'Cửa nhôm kính',
        description: 'Nhôm Xingfa, kính cường lực',
        price: 850000,
        unit: 'm²'
      },
      {
        id: '2',
        name: 'Cửa gỗ công nghiệp',
        price: 1200000,
        unit: 'cánh'
      },
      {
        id: '3',
        name: 'Cửa sắt 2 cánh',
        price: 1800000,
        unit: 'bộ'
      }
    ],
    features: [
      'Đo đạc chính xác tại công trình',
      'Gia công theo yêu cầu',
      'Lắp đặt chắc chắn, kín khít',
      'Đóng mở êm, không kêu',
      'Bảo hành 24 tháng',
      'Bảo dưỡng định kỳ miễn phí'
    ],
    deliveryTime: '5-7 ngày'
  },
  {
    id: '17',
    slug: 'lan-can',
    name: 'Lan Can',
    nameEn: 'Railings & Balustrades',
    description: 'Thi công lan can ban công, lan can cầu thang. Inox, sắt, nhôm, kính. Thiết kế đẹp, an toàn.',
    icon: '🏛️',
    category: 'finishing',
    unit: 'mét',
    pricing: [
      {
        id: '1',
        name: 'Lan can inox 304',
        price: 850000,
        unit: 'mét'
      },
      {
        id: '2',
        name: 'Lan can kính cường lực',
        price: 1200000,
        unit: 'mét'
      },
      {
        id: '3',
        name: 'Lan can sắt sơn tĩnh điện',
        price: 650000,
        unit: 'mét'
      }
    ],
    features: [
      'Thiết kế đẹp, hiện đại',
      'Chắc chắn, an toàn',
      'Chống gỉ, bền màu',
      'Đánh bóng sáng như gương',
      'Thi công nhanh, sạch sẽ',
      'Bảo hành 24 tháng'
    ],
    deliveryTime: '7-10 ngày'
  },
  {
    id: '18',
    slug: 'tho-cong',
    name: 'Thợ Cơng',
    nameEn: 'Woodworker & Carpenter',
    description: 'Thi công đồ gỗ nội thất: tủ bếp, tủ quần áo, giường, bàn ghế... Thiết kế theo yêu cầu, thi công tận nơi.',
    icon: '🪚',
    category: 'finishing',
    unit: 'combo',
    pricing: [
      {
        id: '1',
        name: 'Tủ bếp',
        description: 'Gỗ công nghiệp phủ melamine',
        price: 4500000,
        unit: 'mét dài'
      },
      {
        id: '2',
        name: 'Tủ quần áo',
        description: '3 cánh, cao 2.4m',
        price: 8500000,
        unit: 'bộ'
      },
      {
        id: '3',
        name: 'Giường ngủ',
        description: 'Giường 1m6 x 2m',
        price: 6500000,
        unit: 'bộ'
      }
    ],
    features: [
      'Thiết kế 3D trước khi thi công',
      'Gỗ công nghiệp chuẩn E1',
      'Phụ kiện nhập khẩu (Blum, DTC...)',
      'Thi công tận nơi, lắp đặt chắc chắn',
      'Không mùi, an toàn sức khỏe',
      'Bảo hành 24 tháng'
    ],
    deliveryTime: '10-15 ngày'
  },
  {
    id: '19',
    slug: 'camera',
    name: 'Lắp Camera',
    nameEn: 'Security Camera Installation',
    description: 'Lắp đặt camera an ninh, hệ thống giám sát. Camera IP, wifi, xem từ xa qua điện thoại. Tư vấn vị trí lắp đặt.',
    icon: '📹',
    category: 'tech',
    unit: 'combo',
    pricing: [
      {
        id: '1',
        name: 'Camera IP 2.0MP',
        description: 'Trong nhà, xem qua app',
        price: 1200000,
        unit: 'camera',
        priceNote: 'Chưa bao gồm thi công'
      },
      {
        id: '2',
        name: 'Camera IP 4.0MP',
        description: 'Ngoài trời, chống nước',
        price: 1800000,
        unit: 'camera',
        priceNote: 'Chưa bao gồm thi công'
      },
      {
        id: '3',
        name: 'Lắp đặt camera',
        description: 'Bao gồm dây cáp, đầu ghi',
        price: 500000,
        unit: 'điểm'
      }
    ],
    features: [
      'Camera Full HD, xem đêm rõ nét',
      'Xem từ xa qua điện thoại',
      'Lưu trữ trên cloud hoặc ổ cứng',
      'Cảnh báo chuyển động',
      'Bảo hành 24 tháng',
      'Hỗ trợ kỹ thuật 24/7'
    ],
    deliveryTime: '1-2 ngày'
  }
];

// Helper functions
export const getServiceBySlug = (slug: string): Service | undefined => {
  return SERVICES.find(s => s.slug === slug);
};

export const getServicesByCategory = (category: Service['category']): Service[] => {
  return SERVICES.filter(s => s.category === category);
};

export const searchServices = (query: string): Service[] => {
  const lowerQuery = query.toLowerCase();
  return SERVICES.filter(s => 
    s.name.toLowerCase().includes(lowerQuery) ||
    s.nameEn.toLowerCase().includes(lowerQuery) ||
    s.description.toLowerCase().includes(lowerQuery)
  );
};
