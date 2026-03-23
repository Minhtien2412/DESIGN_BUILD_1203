import 'package:flutter/material.dart';
import '../models/banner_item.dart';
import '../models/category_item.dart';

/// All dummy data for the Customer Home screen.
/// Replace with API calls when backend is ready.
class CustomerData {
  CustomerData._();

  // ─── Hero Banner ───
  static const heroBanner = BannerItem(
    id: 'hero-customer',
    title: 'QUYỀN LỢI\nCỦA THỢ',
    subtitle: 'Tham gia ngay — Nhiều cơ hội hơn\nNhận cơ hội hàng, nhà thợ dễ cà nhau và\nnhờ qua nó thì đều cọc',
    ctaText: 'THAM GIA NGAY',
    startColor: Color(0xFFFF6B35),
    endColor: Color(0xFFE84C2B),
  );

  // ─── Tiện Ích Thiết Kế ───
  static const designCategories = [
    CategoryItem(
      id: 'd1', label: 'Kiến trúc sư',
      icon: Icons.architecture,
      iconColor: Color(0xFFE84C2B), backgroundColor: Color(0xFFFFF3F0),
    ),
    CategoryItem(
      id: 'd2', label: 'Kỹ sư',
      icon: Icons.engineering,
      iconColor: Color(0xFF2196F3), backgroundColor: Color(0xFFE8F4FD),
    ),
    CategoryItem(
      id: 'd3', label: 'Kết cấu',
      icon: Icons.account_balance,
      iconColor: Color(0xFF795548), backgroundColor: Color(0xFFF5EDE8),
    ),
    CategoryItem(
      id: 'd4', label: 'Điện',
      icon: Icons.electric_bolt,
      iconColor: Color(0xFFFFC107), backgroundColor: Color(0xFFFFF8E1),
    ),
    CategoryItem(
      id: 'd5', label: 'Nước',
      icon: Icons.water_drop,
      iconColor: Color(0xFF29B6F6), backgroundColor: Color(0xFFE1F5FE),
    ),
    CategoryItem(
      id: 'd6', label: 'Dự toán',
      icon: Icons.calculate,
      iconColor: Color(0xFF66BB6A), backgroundColor: Color(0xFFE8F5E9),
    ),
    CategoryItem(
      id: 'd7', label: 'Nội thất',
      icon: Icons.chair,
      iconColor: Color(0xFFAB47BC), backgroundColor: Color(0xFFF3E5F5),
    ),
    CategoryItem(
      id: 'd8', label: 'Công cụ AI',
      icon: Icons.smart_toy,
      iconColor: Color(0xFF42A5F5), backgroundColor: Color(0xFFE3F2FD),
    ),
  ];

  static const designPromoBanner = BannerItem(
    id: 'promo-design',
    title: 'TÌM KIẾN TRÚC SƯ —\nNHÀ THIẾT KẾ NỘI THẤT',
    subtitle: 'Dễ tìm đúng người — đúng\nphong cách — Đúng nhu cầu',
    ctaText: 'KHÁM PHÁ NGAY',
    startColor: Color(0xFF2E7D32),
    endColor: Color(0xFF1B5E20),
  );

  // ─── Tiện Ích Xây Dựng ───
  static const constructionCategories = [
    CategoryItem(
      id: 'c1', label: 'Ép cọc',
      icon: Icons.hardware,
      iconColor: Color(0xFF795548), backgroundColor: Color(0xFFF5EDE8),
    ),
    CategoryItem(
      id: 'c2', label: 'Đào đất',
      icon: Icons.landscape,
      iconColor: Color(0xFF8D6E63), backgroundColor: Color(0xFFF5EDE8),
    ),
    CategoryItem(
      id: 'c3', label: 'Vật liệu',
      icon: Icons.inventory_2,
      iconColor: Color(0xFFFF7043), backgroundColor: Color(0xFFFFF3E0),
    ),
    CategoryItem(
      id: 'c4', label: 'Nhân công\nxây dựng',
      icon: Icons.group_work,
      iconColor: Color(0xFF42A5F5), backgroundColor: Color(0xFFE3F2FD),
    ),
    CategoryItem(
      id: 'c5', label: 'Thợ xây',
      icon: Icons.construction,
      iconColor: Color(0xFFEF6C00), backgroundColor: Color(0xFFFFF3E0),
    ),
    CategoryItem(
      id: 'c6', label: 'Thợ sắt',
      icon: Icons.build_circle,
      iconColor: Color(0xFF78909C), backgroundColor: Color(0xFFECEFF1),
    ),
    CategoryItem(
      id: 'c7', label: 'Thợ coffa',
      icon: Icons.view_in_ar,
      iconColor: Color(0xFF8D6E63), backgroundColor: Color(0xFFEFEBE9),
    ),
    CategoryItem(
      id: 'c8', label: 'Thợ cơ khí',
      icon: Icons.precision_manufacturing,
      iconColor: Color(0xFF546E7A), backgroundColor: Color(0xFFECEFF1),
    ),
    CategoryItem(
      id: 'c9', label: 'Thợ tô tường',
      icon: Icons.format_paint,
      iconColor: Color(0xFFAB47BC), backgroundColor: Color(0xFFF3E5F5),
    ),
    CategoryItem(
      id: 'c10', label: 'Thợ điện nước',
      icon: Icons.plumbing,
      iconColor: Color(0xFF29B6F6), backgroundColor: Color(0xFFE1F5FE),
    ),
    CategoryItem(
      id: 'c11', label: 'Bê tông',
      icon: Icons.foundation,
      iconColor: Color(0xFF9E9E9E), backgroundColor: Color(0xFFF5F5F5),
    ),
    CategoryItem(
      id: 'c12', label: 'Xem thêm',
      icon: Icons.more_horiz,
      iconColor: Color(0xFF9E9E9E), backgroundColor: Color(0xFFF5F5F5),
    ),
  ];

  static const constructionPromoBanner = BannerItem(
    id: 'promo-construction',
    title: 'TÌM THỢ\nNHÂN CÔNG NHANH',
    subtitle: 'Đúng nghề - Có mặt nhanh - Trí dùng, ưu đãn\nĐặt trợ app — Không phải chờ đợi',
    ctaText: 'ĐẶT THỢ NGAY',
    startColor: Color(0xFFF9A825),
    endColor: Color(0xFFF57F17),
    textColor: Color(0xFF1A1A1A),
  );

  // ─── Tiện Ích Hoàn Thiện ───
  static const finishingCategories = [
    CategoryItem(
      id: 'f1', label: 'Thợ lát gạch',
      icon: Icons.grid_view,
      iconColor: Color(0xFFEF6C00), backgroundColor: Color(0xFFFFF3E0),
    ),
    CategoryItem(
      id: 'f2', label: 'Thợ thạch cao',
      icon: Icons.layers,
      iconColor: Color(0xFF8D6E63), backgroundColor: Color(0xFFEFEBE9),
    ),
    CategoryItem(
      id: 'f3', label: 'Thợ sơn',
      icon: Icons.brush,
      iconColor: Color(0xFFE91E63), backgroundColor: Color(0xFFFCE4EC),
    ),
    CategoryItem(
      id: 'f4', label: 'Thợ đá',
      icon: Icons.terrain,
      iconColor: Color(0xFF795548), backgroundColor: Color(0xFFEFEBE9),
    ),
    CategoryItem(
      id: 'f5', label: 'Thợ làm cửa',
      icon: Icons.meeting_room,
      iconColor: Color(0xFF6D4C41), backgroundColor: Color(0xFFEFEBE9),
    ),
    CategoryItem(
      id: 'f6', label: 'Thợ lan can',
      icon: Icons.fence,
      iconColor: Color(0xFF78909C), backgroundColor: Color(0xFFECEFF1),
    ),
    CategoryItem(
      id: 'f7', label: 'Thợ cổng',
      icon: Icons.sensor_door,
      iconColor: Color(0xFF546E7A), backgroundColor: Color(0xFFECEFF1),
    ),
    CategoryItem(
      id: 'f8', label: 'Thợ camera',
      icon: Icons.videocam,
      iconColor: Color(0xFF42A5F5), backgroundColor: Color(0xFFE3F2FD),
    ),
  ];

  static const finishingPromoBanner = BannerItem(
    id: 'promo-finishing',
    title: 'TÌM THỢ HOÀN THIỆN\nGẦN BẠN',
    subtitle: 'Có mặt nhanh — dễ liên hệ —\nchọn đúng tay nghề',
    ctaText: 'TÌM NGAY',
    startColor: Color(0xFFFF6B35),
    endColor: Color(0xFFE84C2B),
  );
}
