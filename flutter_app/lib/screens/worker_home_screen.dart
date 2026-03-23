import 'package:flutter/material.dart';
import '../data/worker_data.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../widgets/category_grid.dart';
import '../widgets/design_live_section.dart';
import '../widgets/media_dual_section.dart';
import '../widgets/product_section.dart';
import '../widgets/promo_banner.dart';
import '../widgets/search_header.dart';
import '../widgets/section_header.dart';

/// Worker home screen — the primary view for contractors/workers.
///
/// Layout matches the design mockup:
///   SearchHeader → Service Grid → Design Live → Shield Banner →
///   Maintenance section → Promo → Shopping section →
///   Live/Video dual section → Products → Furniture Promo
///
/// All data comes from [WorkerData] and can be swapped with API responses.
class WorkerHomeScreen extends StatelessWidget {
  const WorkerHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ─── Search Header with "DỊCH VỤ" label ───
              const SearchHeader(label: 'DỊCH VỤ'),

              // ─── Service Grid ───
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.sm),
                child: CategoryGrid(
                  items: WorkerData.serviceCategories,
                  onItemTap: (item) => _onCategoryTap(context, item.id),
                ),
              ),

              // ─── Design Live Carousel ───
              DesignLiveSection(items: WorkerData.designLiveItems),

              // ─── Shield Banner ───
              const PromoBanner(
                banner: WorkerData.shieldBanner,
                height: 170,
              ),

              // ─── Tiện Ích Bảo Trì - Sửa Chữa ───
              const SectionHeader(
                title: 'TIỆN ÍCH BẢO TRÌ - SỬA CHỮA',
                searchHint: 'Tìm thợ sửa điện, thợ nước, thợ máy lạnh...',
              ),
              CategoryGrid(
                items: WorkerData.maintenanceCategories,
                onItemTap: (item) => _onCategoryTap(context, item.id),
              ),

              // ─── Maintenance Promo Banner ───
              const PromoBanner(banner: WorkerData.maintenancePromoBanner),

              // ─── Tiện Ích Mua Sắm Trang Thiết Bị ───
              const SectionHeader(
                title: 'TIỆN ÍCH MUA SẮM TRANG THIẾT BỊ',
                searchHint: 'Tìm sofa ghế bàn, đèn, xe trang bày...',
              ),
              CategoryGrid(
                items: WorkerData.shoppingCategories,
                onItemTap: (item) => _onCategoryTap(context, item.id),
              ),

              // ─── LIVE & VIDEO Dual Section ───
              const MediaDualSection(
                leftTitle: 'LIVE',
                rightTitle: 'VIDEO',
                leftItems: WorkerData.liveItems,
                rightItems: WorkerData.videoItems,
              ),

              // ─── Sản Phẩm Nội Thất ───
              ProductSection(
                title: 'SẢN PHẨM NỘI THẤT',
                items: WorkerData.products,
                onItemTap: (product) => _onProductTap(context, product.id),
              ),

              // ─── Furniture Promo Banner ───
              _buildFurniturePromo(),

              const SizedBox(height: AppSpacing.xxxl),
            ],
          ),
        ),
      ),
    );
  }

  /// Special furniture promo with discount badges matching the design.
  Widget _buildFurniturePromo() {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.sm,
      ),
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1565C0), Color(0xFF0D47A1)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF1565C0).withAlpha(77),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            // Banner header
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.xl, AppSpacing.xl, AppSpacing.xl, AppSpacing.md,
              ),
              child: Row(
                children: [
                  // Label badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.accentRed,
                      borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                    ),
                    child: const Text(
                      'DEAL HOT',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'TIỆN ÍCH NỘI THẤT',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Sắm tiện ích hiện đại —\nnâng cấp không gian sống',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.white70,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Discount badges row
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.xl,
              ),
              child: Row(
                children: [
                  _discountBadge('GIẢM ĐẾN\n30%', AppColors.accentRed),
                  const SizedBox(width: AppSpacing.sm),
                  _discountBadge('TẶNG\nVOUCHER', AppColors.primaryOrange),
                  const SizedBox(width: AppSpacing.sm),
                  _discountBadge('BẢO HÀNH\nDÀI HẠN', const Color(0xFF2E7D32)),
                  const SizedBox(width: AppSpacing.sm),
                  _discountBadge('LẮP ĐẶT\nTẠI NHÀ', const Color(0xFF00838F)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _discountBadge(String text, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        ),
        child: Text(
          text,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: Colors.white,
            height: 1.3,
          ),
        ),
      ),
    );
  }

  void _onCategoryTap(BuildContext context, String categoryId) {
    debugPrint('Worker category tapped: $categoryId');
    // TODO: Navigate to category/service detail
  }

  void _onProductTap(BuildContext context, String productId) {
    debugPrint('Product tapped: $productId');
    // TODO: Navigate to product detail screen
  }
}
