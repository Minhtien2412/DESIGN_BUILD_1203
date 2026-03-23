import 'package:flutter/material.dart';
import '../models/banner_item.dart';
import '../theme/app_spacing.dart';

/// Large hero banner at the top of the Customer screen.
/// Features gradient background, bold title, subtitle, and CTA button.
class HeroBanner extends StatelessWidget {
  final BannerItem banner;
  final VoidCallback? onTap;

  const HeroBanner({
    super.key,
    required this.banner,
    this.onTap,
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
          height: AppSpacing.heroBannerHeight,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [banner.startColor, banner.endColor],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
            borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
            boxShadow: [
              BoxShadow(
                color: banner.startColor.withAlpha(77),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Stack(
            children: [
              // Background decorative element
              Positioned(
                right: -10,
                top: 10,
                bottom: 10,
                child: Container(
                  width: 150,
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(20),
                    borderRadius: BorderRadius.circular(75),
                  ),
                ),
              ),
              Positioned(
                right: 20,
                bottom: -20,
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withAlpha(15),
                  ),
                ),
              ),

              // Placeholder for illustration (right side)
              Positioned(
                right: AppSpacing.lg,
                top: AppSpacing.xl,
                bottom: AppSpacing.xl,
                child: AspectRatio(
                  aspectRatio: 1,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withAlpha(30),
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                    child: Icon(
                      Icons.groups,
                      size: 48,
                      color: banner.textColor.withAlpha(153),
                    ),
                  ),
                ),
              ),

              // Text content
              Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      banner.title,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: banner.textColor,
                        height: 1.2,
                      ),
                    ),
                    if (banner.subtitle != null) ...[
                      const SizedBox(height: AppSpacing.sm),
                      SizedBox(
                        width: MediaQuery.of(context).size.width * 0.5,
                        child: Text(
                          banner.subtitle!,
                          style: TextStyle(
                            fontSize: 11,
                            color: banner.textColor.withAlpha(230),
                            height: 1.4,
                          ),
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                    if (banner.ctaText != null) ...[
                      const SizedBox(height: AppSpacing.md),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.lg,
                          vertical: AppSpacing.sm + 2,
                        ),
                        decoration: BoxDecoration(
                          color: banner.textColor,
                          borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withAlpha(38),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Text(
                          banner.ctaText!,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: banner.startColor,
                          ),
                        ),
                      ),
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
}
