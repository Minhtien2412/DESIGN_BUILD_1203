import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_text_styles.dart';

/// Section title row with optional inline search pill and "View All" link.
/// Adapts to 3 layout modes:
///   1. Title + search pill (category sections)
///   2. Title + "Xem thêm >" link (live/product sections)
///   3. Title only
class SectionHeader extends StatelessWidget {
  final String title;
  final IconData? titleIcon;
  final Color? titleIconColor;
  final String? searchHint;
  final VoidCallback? onSearchTap;
  final String? viewAllText;
  final VoidCallback? onViewAllTap;

  const SectionHeader({
    super.key,
    required this.title,
    this.titleIcon,
    this.titleIconColor,
    this.searchHint,
    this.onSearchTap,
    this.viewAllText,
    this.onViewAllTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg, AppSpacing.xl, AppSpacing.lg, AppSpacing.sm,
      ),
      child: Row(
        children: [
          // Optional icon before title
          if (titleIcon != null) ...[
            Icon(titleIcon, size: 18, color: titleIconColor ?? AppColors.primaryOrange),
            const SizedBox(width: AppSpacing.xs),
          ],

          // Title
          Text(title, style: AppTextStyles.sectionTitle),

          // Inline search pill
          if (searchHint != null) ...[
            const SizedBox(width: AppSpacing.sm),
            Expanded(child: _buildSearchPill()),
          ],

          // "Xem thêm / Xem tất cả" link
          if (onViewAllTap != null) ...[
            const Spacer(),
            GestureDetector(
              onTap: onViewAllTap,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(viewAllText ?? 'Xem tất cả', style: AppTextStyles.viewAll),
                  const SizedBox(width: 2),
                  const Icon(Icons.chevron_right, size: 16, color: AppColors.primaryOrange),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSearchPill() {
    return GestureDetector(
      onTap: onSearchTap,
      child: Container(
        height: AppSpacing.sectionSearchHeight,
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
        ),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
        child: Row(
          children: [
            const Icon(Icons.search, size: 14, color: AppColors.textHint),
            const SizedBox(width: AppSpacing.xs),
            Expanded(
              child: Text(
                searchHint!,
                style: AppTextStyles.sectionSearchHint,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
