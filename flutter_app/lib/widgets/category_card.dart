import 'package:flutter/material.dart';
import '../models/category_item.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_text_styles.dart';

/// A single category tile: rounded icon box + label below.
/// Used inside [CategoryGrid].
class CategoryCard extends StatelessWidget {
  final CategoryItem item;
  final VoidCallback? onTap;

  const CategoryCard({
    super.key,
    required this.item,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Icon container
          Container(
            width: AppSpacing.categoryIconBox,
            height: AppSpacing.categoryIconBox,
            decoration: BoxDecoration(
              color: item.backgroundColor,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            ),
            child: Icon(
              item.icon,
              size: 28,
              color: item.iconColor,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          // Label
          SizedBox(
            width: AppSpacing.categoryLabelWidth,
            child: Text(
              item.label,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.categoryLabel,
            ),
          ),
        ],
      ),
    );
  }
}
