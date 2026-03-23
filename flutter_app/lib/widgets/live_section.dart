import 'package:flutter/material.dart';
import '../models/live_item.dart';
import '../theme/app_spacing.dart';
import 'live_card.dart';
import 'section_header.dart';

/// Horizontal scrolling section of [LiveCard] items with a header.
class LiveSection extends StatelessWidget {
  final String title;
  final List<LiveItem> items;
  final VoidCallback? onViewAll;
  final Function(LiveItem)? onItemTap;
  final double cardWidth;
  final double cardHeight;

  const LiveSection({
    super.key,
    required this.title,
    required this.items,
    this.onViewAll,
    this.onItemTap,
    this.cardWidth = 200,
    this.cardHeight = 130,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: title,
          viewAllText: 'Xem thêm',
          onViewAllTap: onViewAll,
        ),
        SizedBox(
          height: cardHeight + 4, // slight padding for shadow
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.md),
            itemBuilder: (context, index) => LiveCard(
              item: items[index],
              width: cardWidth,
              height: cardHeight,
              onTap: () => onItemTap?.call(items[index]),
            ),
          ),
        ),
      ],
    );
  }
}
