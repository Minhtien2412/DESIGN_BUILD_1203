import 'package:flutter/material.dart';
import '../models/category_item.dart';
import '../theme/app_spacing.dart';
import 'category_card.dart';

/// A responsive grid of [CategoryCard] widgets (default 4 columns).
/// Uses [GridView] with shrinkWrap so it can sit inside a [Column]/[SingleChildScrollView].
class CategoryGrid extends StatelessWidget {
  final List<CategoryItem> items;
  final int crossAxisCount;
  final Function(CategoryItem)? onItemTap;

  const CategoryGrid({
    super.key,
    required this.items,
    this.crossAxisCount = 4,
    this.onItemTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          childAspectRatio: 0.82,
          mainAxisSpacing: AppSpacing.sm,
          crossAxisSpacing: 0,
        ),
        itemCount: items.length,
        itemBuilder: (context, index) {
          return CategoryCard(
            item: items[index],
            onTap: () => onItemTap?.call(items[index]),
          );
        },
      ),
    );
  }
}
