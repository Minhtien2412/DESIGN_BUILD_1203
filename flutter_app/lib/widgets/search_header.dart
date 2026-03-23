import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_text_styles.dart';

/// Top search bar with optional label text and hamburger menu.
/// Used at the top of both Customer and Worker home screens.
class SearchHeader extends StatelessWidget {
  final String hintText;
  final String? label;
  final VoidCallback? onSearchTap;
  final VoidCallback? onMenuTap;

  const SearchHeader({
    super.key,
    this.hintText = 'Tìm kiếm...',
    this.label,
    this.onSearchTap,
    this.onMenuTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.sm,
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: onSearchTap,
              child: Container(
                height: AppSpacing.searchBarHeight,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                  border: Border.all(color: AppColors.border),
                ),
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Row(
                  children: [
                    const Icon(Icons.search, color: AppColors.textHint, size: 20),
                    const SizedBox(width: AppSpacing.sm),
                    if (label != null)
                      Text(
                        label!,
                        style: AppTextStyles.sectionTitle.copyWith(fontSize: 14),
                      )
                    else
                      Expanded(
                        child: Text(hintText, style: AppTextStyles.searchHint),
                      ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          GestureDetector(
            onTap: onMenuTap,
            child: Container(
              width: AppSpacing.searchBarHeight,
              height: AppSpacing.searchBarHeight,
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                border: Border.all(color: AppColors.border),
              ),
              child: const Icon(Icons.menu, color: AppColors.textPrimary),
            ),
          ),
        ],
      ),
    );
  }
}
