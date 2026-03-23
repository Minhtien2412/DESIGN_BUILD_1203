import 'package:flutter/material.dart';
import '../models/product_item.dart';
import '../theme/app_spacing.dart';
import 'product_card.dart';
import 'section_header.dart';

/// Horizontal scrolling section of [ProductCard] items with a header.
class ProductSection extends StatelessWidget {
  final String title;
  final List<ProductItem> items;
  final VoidCallback? onViewAll;
  final Function(ProductItem)? onItemTap;

  const ProductSection({
    super.key,
    required this.title,
    required this.items,
    this.onViewAll,
    this.onItemTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: title,
          viewAllText: 'Xem tất cả',
          onViewAllTap: onViewAll,
        ),
        SizedBox(
          height: 260,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.md),
            itemBuilder: (context, index) => ProductCard(
              item: items[index],
              onTap: () => onItemTap?.call(items[index]),
            ),
          ),
        ),
      ],
    );
  }
}
