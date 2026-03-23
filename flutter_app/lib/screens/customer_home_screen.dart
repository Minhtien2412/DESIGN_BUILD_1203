import 'package:flutter/material.dart';
import '../data/customer_data.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../widgets/category_grid.dart';
import '../widgets/hero_banner.dart';
import '../widgets/promo_banner.dart';
import '../widgets/search_header.dart';
import '../widgets/section_header.dart';

/// Customer home screen — the primary view for clients/homeowners.
///
/// Layout matches the design mockup:
///   SearchHeader → HeroBanner → Design section → Promo →
///   Construction section → Promo → Finishing section → Promo
///
/// All data comes from [CustomerData] and can be swapped with API responses.
class CustomerHomeScreen extends StatelessWidget {
  const CustomerHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ─── Search Header ───
              const SearchHeader(hintText: 'Tìm kiếm...'),

              // ─── Hero Banner ───
              const HeroBanner(banner: CustomerData.heroBanner),

              // ─── Tiện Ích Thiết Kế ───
              const SectionHeader(
                title: 'TIỆN ÍCH THIẾT KẾ',
                searchHint: 'Tìm giám sát, PKCC...',
              ),
              CategoryGrid(
                items: CustomerData.designCategories,
                onItemTap: (item) => _onCategoryTap(context, item.id),
              ),

              // ─── Design Promo Banner ───
              const PromoBanner(banner: CustomerData.designPromoBanner),

              // ─── Tiện Ích Xây Dựng ───
              const SectionHeader(
                title: 'TIỆN ÍCH XÂY DỰNG',
                searchHint: 'Tìm thợ thợ cống, thán, thợ nhìu...',
              ),
              CategoryGrid(
                items: CustomerData.constructionCategories,
                onItemTap: (item) => _onCategoryTap(context, item.id),
              ),

              // ─── Construction Promo Banner ───
              const PromoBanner(banner: CustomerData.constructionPromoBanner),

              // ─── Tiện Ích Hoàn Thiện ───
              const SectionHeader(
                title: 'TIỆN ÍCH HOÀN THIỆN',
                searchHint: 'Thợ điện tường mặt phần gạch sơn...',
              ),
              CategoryGrid(
                items: CustomerData.finishingCategories,
                onItemTap: (item) => _onCategoryTap(context, item.id),
              ),

              // ─── Hot Section Tag + Finishing Promo ───
              _buildHotTag(),
              const PromoBanner(banner: CustomerData.finishingPromoBanner),

              const SizedBox(height: AppSpacing.xxxl),
            ],
          ),
        ),
      ),
    );
  }

  /// Small "TIỆN ÍCH HOT" badge shown before the last promo banner.
  Widget _buildHotTag() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.xs,
      ),
      child: Row(
        children: [
          Icon(Icons.local_fire_department, size: 18, color: AppColors.primaryOrange),
          const SizedBox(width: AppSpacing.xs),
          Text(
            'TIỆN ÍCH HOT',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.primaryOrange,
            ),
          ),
        ],
      ),
    );
  }

  /// Placeholder for category tap — replace with Navigator.push or router.
  void _onCategoryTap(BuildContext context, String categoryId) {
    debugPrint('Category tapped: $categoryId');
    // TODO: Navigate to category detail screen
    // Navigator.push(context, MaterialPageRoute(
    //   builder: (_) => CategoryDetailScreen(categoryId: categoryId),
    // ));
  }
}
