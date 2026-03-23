import 'package:flutter/material.dart';
import '../models/banner_item.dart';
import '../models/category_item.dart';
import '../models/live_item.dart';
import '../models/product_item.dart';

/// All dummy data for the Worker Home screen.
/// Replace with API calls when backend is ready.
class WorkerData {
  WorkerData._();

  // ─── Dịch Vụ (Service Grid) ───
  static const serviceCategories = [
    CategoryItem(
      id: 's1', label: 'Thiết kế nhà',
      icon: Icons.home_work,
      iconColor: Color(0xFF1B5E20), backgroundColor: Color(0xFFE8F5E9),
    ),
    CategoryItem(
      id: 's2', label: 'Thiết kế\nnội thất',
      icon: Icons.design_services,
      iconColor: Color(0xFF6A1B9A), backgroundColor: Color(0xFFF3E5F5),
    ),
    CategoryItem(
      id: 's3', label: 'Tra cứu\nxây dựng',
      icon: Icons.search,
      iconColor: Color(0xFF1565C0), backgroundColor: Color(0xFFE3F2FD),
    ),
    CategoryItem(
      id: 's4', label: 'Xin phép',
      icon: Icons.assignment,
      iconColor: Color(0xFFE65100), backgroundColor: Color(0xFFFFF3E0),
    ),
    CategoryItem(
      id: 's5', label: 'Hồ sơ mẫu',
      icon: Icons.folder_open,
      iconColor: Color(0xFF2E7D32), backgroundColor: Color(0xFFE8F5E9),
    ),
    CategoryItem(
      id: 's6', label: 'Lỗ ban',
      icon: Icons.straighten,
      iconColor: Color(0xFF795548), backgroundColor: Color(0xFFEFEBE9),
    ),
    CategoryItem(
      id: 's7', label: 'Bảng màu',
      icon: Icons.palette,
      iconColor: Color(0xFFAD1457), backgroundColor: Color(0xFFFCE4EC),
    ),
    CategoryItem(
      id: 's8', label: 'Tư vấn\nchất lượng',
      icon: Icons.verified,
      iconColor: Color(0xFF00838F), backgroundColor: Color(0xFFE0F7FA),
    ),
    CategoryItem(
      id: 's9', label: 'Công ty\nxây dựng',
      icon: Icons.business,
      iconColor: Color(0xFF37474F), backgroundColor: Color(0xFFECEFF1),
    ),
    CategoryItem(
      id: 's10', label: 'Công ty\nnội thất',
      icon: Icons.store,
      iconColor: Color(0xFF4E342E), backgroundColor: Color(0xFFEFEBE9),
    ),
    CategoryItem(
      id: 's11', label: 'Giám sát\nchất lượng',
      icon: Icons.visibility,
      iconColor: Color(0xFF1565C0), backgroundColor: Color(0xFFE3F2FD),
    ),
    CategoryItem(
      id: 's12', label: 'Xem thêm',
      icon: Icons.more_horiz,
      iconColor: Color(0xFF9E9E9E), backgroundColor: Color(0xFFF5F5F5),
    ),
  ];

  // ─── Design Live Carousel ───
  static const designLiveItems = [
    LiveItem(id: 'dl1', title: 'Phòng khách hiện đại', viewCount: 3200),
    LiveItem(id: 'dl2', title: 'Nội thất phòng ngủ', viewCount: 2800),
    LiveItem(id: 'dl3', title: 'Không gian bếp sang trọng', viewCount: 1500),
    LiveItem(id: 'dl4', title: 'Phòng tắm cao cấp', viewCount: 980),
  ];

  // ─── Shield Banner ───
  static const shieldBanner = BannerItem(
    id: 'shield',
    title: 'LÁ CHẮN BẢO VỆ\nKHÁCH HÀNG',
    subtitle: 'Minh bạch – dễ chọn – Hỗ trợ nhanh\n\nXem rõ cà dùng, lợi ích, giải đáp\nmọi thắc mắc nhanh nhất có thể',
    ctaText: 'KHÁM PHÁ NGAY',
    startColor: Color(0xFF2E7D32),
    endColor: Color(0xFF1B5E20),
  );

  // ─── Tiện Ích Bảo Trì - Sửa Chữa ───
  static const maintenanceCategories = [
    CategoryItem(
      id: 'm1', label: 'Thợ sửa\nmáy giặt',
      icon: Icons.local_laundry_service,
      iconColor: Color(0xFF1565C0), backgroundColor: Color(0xFFE3F2FD),
    ),
    CategoryItem(
      id: 'm2', label: 'Thợ sửa\ntủ lạnh',
      icon: Icons.kitchen,
      iconColor: Color(0xFF00838F), backgroundColor: Color(0xFFE0F7FA),
    ),
    CategoryItem(
      id: 'm3', label: 'Thợ thông\ntắc cống',
      icon: Icons.plumbing,
      iconColor: Color(0xFF6D4C41), backgroundColor: Color(0xFFEFEBE9),
    ),
    CategoryItem(
      id: 'm4', label: 'Thợ điện',
      icon: Icons.electrical_services,
      iconColor: Color(0xFFF9A825), backgroundColor: Color(0xFFFFF8E1),
    ),
    CategoryItem(
      id: 'm5', label: 'Thợ cấp nước',
      icon: Icons.water,
      iconColor: Color(0xFF0288D1), backgroundColor: Color(0xFFE1F5FE),
    ),
    CategoryItem(
      id: 'm6', label: 'Thợ mạng\n– wifi',
      icon: Icons.wifi,
      iconColor: Color(0xFF7B1FA2), backgroundColor: Color(0xFFF3E5F5),
    ),
    CategoryItem(
      id: 'm7', label: 'Thợ sửa máy\nlạnh',
      icon: Icons.ac_unit,
      iconColor: Color(0xFF00BCD4), backgroundColor: Color(0xFFE0F7FA),
    ),
    CategoryItem(
      id: 'm8', label: 'Xem thêm',
      icon: Icons.more_horiz,
      iconColor: Color(0xFF9E9E9E), backgroundColor: Color(0xFFF5F5F5),
    ),
  ];

  static const maintenancePromoBanner = BannerItem(
    id: 'promo-maintenance',
    title: 'TIỆN ÍCH\nBẢO TRÌ',
    subtitle: 'Đặt nhanh — Xử lý sớm — An tâm hơn\nTrong tiến chuẩn thời gian, hỗ trợ nhanh chóng',
    ctaText: 'ĐẶT LỊCH NGAY',
    startColor: Color(0xFFF9A825),
    endColor: Color(0xFFF57F17),
    textColor: Color(0xFF1A1A1A),
  );

  // ─── Tiện Ích Mua Sắm Trang Thiết Bị ───
  static const shoppingCategories = [
    CategoryItem(
      id: 'sh1', label: 'Thiết bị bếp',
      icon: Icons.countertops,
      iconColor: Color(0xFFE65100), backgroundColor: Color(0xFFFFF3E0),
    ),
    CategoryItem(
      id: 'sh2', label: 'Thiết bị\nvệ sinh',
      icon: Icons.bathtub,
      iconColor: Color(0xFF0277BD), backgroundColor: Color(0xFFE1F5FE),
    ),
    CategoryItem(
      id: 'sh3', label: 'Điện',
      icon: Icons.power,
      iconColor: Color(0xFFF9A825), backgroundColor: Color(0xFFFFF8E1),
    ),
    CategoryItem(
      id: 'sh4', label: 'Nước',
      icon: Icons.water_damage,
      iconColor: Color(0xFF0288D1), backgroundColor: Color(0xFFE1F5FE),
    ),
    CategoryItem(
      id: 'sh5', label: 'PCCC',
      icon: Icons.fire_extinguisher,
      iconColor: Color(0xFFD32F2F), backgroundColor: Color(0xFFFFEBEE),
    ),
    CategoryItem(
      id: 'sh6', label: 'Bàn ăn',
      icon: Icons.table_restaurant,
      iconColor: Color(0xFF6D4C41), backgroundColor: Color(0xFFEFEBE9),
    ),
    CategoryItem(
      id: 'sh7', label: 'Bàn học',
      icon: Icons.table_chart,
      iconColor: Color(0xFF37474F), backgroundColor: Color(0xFFECEFF1),
    ),
    CategoryItem(
      id: 'sh8', label: 'Sofa',
      icon: Icons.weekend,
      iconColor: Color(0xFF4CAF50), backgroundColor: Color(0xFFE8F5E9),
    ),
  ];

  // ─── Live & Video ───
  static const liveItems = [
    LiveItem(id: 'l1', title: 'ĐỀU SALE...', isLive: true, viewCount: 1200),
    LiveItem(id: 'l2', title: 'Nội thất đẹp', isLive: true, viewCount: 850),
    LiveItem(id: 'l3', title: 'Giảm giá sốc', isLive: true, viewCount: 560),
  ];

  static const videoItems = [
    LiveItem(id: 'v1', title: 'Thiết kế phòng khách', viewCount: 29500),
    LiveItem(id: 'v2', title: 'Sofa hiện đại 2024', viewCount: 21800),
    LiveItem(id: 'v3', title: 'Xu hướng nội thất', viewCount: 15600),
  ];

  // ─── Sản Phẩm Nội Thất ───
  static const products = [
    ProductItem(
      id: 'p1',
      name: 'Sofa hiện đại phong cách Bắc Âu cao cấp',
      price: 1200000,
      soldCount: 1240,
    ),
    ProductItem(
      id: 'p2',
      name: 'Bàn ăn gỗ sồi tự nhiên chân sắt sơn tĩnh điện',
      price: 2450000,
      soldCount: 856,
    ),
    ProductItem(
      id: 'p3',
      name: 'Đèn học mini tối giản tiện lợi',
      price: 350000,
      soldCount: 2700,
    ),
    ProductItem(
      id: 'p4',
      name: 'Kệ sách gỗ 5 tầng đa năng',
      price: 890000,
      soldCount: 1560,
    ),
  ];

  // ─── Furniture Promo Banner ───
  static const furniturePromoBanner = BannerItem(
    id: 'promo-furniture',
    title: 'TIỆN ÍCH\nNỘI THẤT',
    subtitle: 'Sắm tiện ích hiện đại —\nnâng cấp không gian sống',
    ctaText: 'XEM NGAY',
    startColor: Color(0xFF1565C0),
    endColor: Color(0xFF0D47A1),
  );
}
