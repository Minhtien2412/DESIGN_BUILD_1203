import 'package:flutter/material.dart';
import '../models/banner_item.dart';
import '../theme/app_spacing.dart';

/// Full-width promotional banner with gradient background,
/// decorative circles, title, subtitle, and CTA button.
class PromoBanner extends StatelessWidget {
  final BannerItem banner;
  final VoidCallback? onTap;
  final double height;

  const PromoBanner({
    super.key,
    required this.banner,
    this.onTap,
    this.height = 160,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.sm,
      ),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: height,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [banner.startColor, banner.endColor],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
            boxShadow: [
              BoxShadow(
                color: banner.startColor.withAlpha(77),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Stack(
            children: [
              // Decorative circles
              Positioned(
                right: -20,
                top: -20,
                child: _decorCircle(120, 0.1),
              ),
              Positioned(
                right: 30,
                bottom: -30,
                child: _decorCircle(80, 0.08),
              ),

              // Content
              Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      banner.title,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: banner.textColor,
                        height: 1.3,
                      ),
                    ),
                    if (banner.subtitle != null) ...[
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        banner.subtitle!,
                        style: TextStyle(
                          fontSize: 12,
                          color: banner.textColor.withAlpha(217),
                          height: 1.4,
                        ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    if (banner.ctaText != null) ...[
                      const SizedBox(height: AppSpacing.md),
                      _buildCta(),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCta() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: banner.textColor,
        borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
      ),
      child: Text(
        banner.ctaText!,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: banner.startColor,
        ),
      ),
    );
  }

  Widget _decorCircle(double size, double opacity) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white.withAlpha((opacity * 255).round()),
      ),
    );
  }
}
