import 'package:flutter/material.dart';
import '../models/live_item.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_text_styles.dart';
import 'live_card.dart';

/// Side-by-side LIVE and VIDEO sections shown on the Worker screen.
/// Each column has a small header with "Xem thêm" link and horizontal cards.
class MediaDualSection extends StatelessWidget {
  final String leftTitle;
  final String rightTitle;
  final List<LiveItem> leftItems;
  final List<LiveItem> rightItems;
  final VoidCallback? onLeftViewAll;
  final VoidCallback? onRightViewAll;

  const MediaDualSection({
    super.key,
    required this.leftTitle,
    required this.rightTitle,
    required this.leftItems,
    required this.rightItems,
    this.onLeftViewAll,
    this.onRightViewAll,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg, AppSpacing.xl, AppSpacing.lg, AppSpacing.sm,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: _buildColumn(leftTitle, leftItems, onLeftViewAll),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: _buildColumn(rightTitle, rightItems, onRightViewAll),
          ),
        ],
      ),
    );
  }

  Widget _buildColumn(String title, List<LiveItem> items, VoidCallback? onViewAll) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header row
        Row(
          children: [
            Text(
              title,
              style: AppTextStyles.sectionTitle.copyWith(
                color: AppColors.primaryOrange,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Spacer(),
            GestureDetector(
              onTap: onViewAll,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Xem thêm', style: AppTextStyles.viewAll.copyWith(fontSize: 11)),
                  const Icon(Icons.chevron_right, size: 14, color: AppColors.primaryOrange),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),

        // Cards (horizontal scroll within half-width)
        SizedBox(
          height: 110,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
            itemBuilder: (context, index) => LiveCard(
              item: items[index],
              width: 140,
              height: 105,
            ),
          ),
        ),
      ],
    );
  }
}
