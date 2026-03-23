import 'package:flutter/material.dart';
import '../models/live_item.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// A single live/video card with thumbnail placeholder, badge, and title overlay.
class LiveCard extends StatelessWidget {
  final LiveItem item;
  final VoidCallback? onTap;
  final double width;
  final double height;

  const LiveCard({
    super.key,
    required this.item,
    this.onTap,
    this.width = 200,
    this.height = 130,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
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
              // Thumbnail placeholder
              Container(
                color: AppColors.background,
                child: const Center(
                  child: Icon(Icons.play_circle_outline, size: 36, color: AppColors.textHint),
                ),
              ),

              // Badge (LIVE or view count)
              Positioned(
                left: AppSpacing.sm,
                top: AppSpacing.sm,
                child: _buildBadge(),
              ),

              // Title overlay at bottom
              Positioned(
                left: 0, right: 0, bottom: 0,
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [Colors.black.withAlpha(179), Colors.transparent],
                    ),
                  ),
                  child: Text(
                    item.title,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 3),
      decoration: BoxDecoration(
        color: item.isLive ? AppColors.accentRed : Colors.black54,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: item.isLive
            ? [
                Container(
                  width: 6, height: 6,
                  decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white),
                ),
                const SizedBox(width: 4),
                const Text('LIVE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
              ]
            : [
                const Icon(Icons.visibility, size: 12, color: Colors.white),
                const SizedBox(width: 4),
                Text(item.formattedViewCount, style: const TextStyle(fontSize: 10, color: Colors.white)),
              ],
      ),
    );
  }
}
