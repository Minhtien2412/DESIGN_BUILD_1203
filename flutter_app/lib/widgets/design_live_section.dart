import 'package:flutter/material.dart';
import '../models/live_item.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_text_styles.dart';

/// Horizontal carousel of design/interior images with navigation arrows.
/// Used in the "DESIGN LIVE" section of the Worker screen.
class DesignLiveSection extends StatefulWidget {
  final List<LiveItem> items;
  final VoidCallback? onViewAll;

  const DesignLiveSection({
    super.key,
    required this.items,
    this.onViewAll,
  });

  @override
  State<DesignLiveSection> createState() => _DesignLiveSectionState();
}

class _DesignLiveSectionState extends State<DesignLiveSection> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollBy(double offset) {
    _scrollController.animateTo(
      (_scrollController.offset + offset).clamp(
        0.0,
        _scrollController.position.maxScrollExtent,
      ),
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg, AppSpacing.xl, AppSpacing.lg, AppSpacing.sm,
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: const Text(
                  'DESIGN LIVE',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: widget.onViewAll,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('XEM THÊM', style: AppTextStyles.viewAll.copyWith(fontSize: 11)),
                    const SizedBox(width: 2),
                    const Icon(Icons.chevron_right, size: 14, color: AppColors.primaryOrange),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Carousel with arrows
        SizedBox(
          height: AppSpacing.designCardHeight + 8,
          child: Stack(
            children: [
              ListView.separated(
                controller: _scrollController,
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                itemCount: widget.items.length,
                separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.md),
                itemBuilder: (context, index) => _buildCard(widget.items[index]),
              ),

              // Left arrow
              Positioned(
                left: AppSpacing.xs,
                top: 0, bottom: 0,
                child: Center(child: _arrowButton(Icons.chevron_left, () => _scrollBy(-240))),
              ),

              // Right arrow
              Positioned(
                right: AppSpacing.xs,
                top: 0, bottom: 0,
                child: Center(child: _arrowButton(Icons.chevron_right, () => _scrollBy(240))),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCard(LiveItem item) {
    return Container(
      width: AppSpacing.designCardWidth,
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: AppColors.border),
        boxShadow: const [
          BoxShadow(color: AppColors.shadow, blurRadius: 4, offset: Offset(0, 2)),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Container(
              color: AppColors.background,
              child: Center(
                child: Icon(
                  Icons.living,
                  size: 48,
                  color: AppColors.textHint.withAlpha(128),
                ),
              ),
            ),
            Positioned(
              left: 0, right: 0, bottom: 0,
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [Colors.black.withAlpha(153), Colors.transparent],
                  ),
                ),
                child: Text(
                  item.title,
                  style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w500),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _arrowButton(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: Colors.white.withAlpha(230),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(color: Colors.black.withAlpha(26), blurRadius: 4, offset: const Offset(0, 1)),
          ],
        ),
        child: Icon(icon, size: 20, color: AppColors.textPrimary),
      ),
    );
  }
}
