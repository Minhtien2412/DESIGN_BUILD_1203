import 'package:flutter/material.dart';

/// Centralized color palette based on design screenshots.
/// Customer screen uses warm tones (orange/red), Worker screen uses cooler tones (green/teal).
class AppColors {
  AppColors._();

  // ── Primary ──
  static const Color primaryOrange = Color(0xFFE84C2B);
  static const Color primaryGreen = Color(0xFF1B7A3D);
  static const Color primaryDark = Color(0xFF1A1A2E);

  // ── Background ──
  static const Color background = Color(0xFFF5F5F5);
  static const Color surface = Colors.white;
  static const Color scaffoldBg = Color(0xFFFAFAFA);

  // ── Text ──
  static const Color textPrimary = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textHint = Color(0xFF9CA3AF);

  // ── Accent ──
  static const Color accentYellow = Color(0xFFFFC107);
  static const Color accentBlue = Color(0xFF2196F3);
  static const Color accentRed = Color(0xFFEF4444);

  // ── Banner Gradients ──
  static const Color bannerOrangeStart = Color(0xFFFF6B35);
  static const Color bannerOrangeEnd = Color(0xFFE84C2B);
  static const Color bannerGreenStart = Color(0xFF2E7D32);
  static const Color bannerGreenEnd = Color(0xFF1B5E20);
  static const Color bannerYellowStart = Color(0xFFF9A825);
  static const Color bannerYellowEnd = Color(0xFFF57F17);
  static const Color bannerBlueStart = Color(0xFF1565C0);
  static const Color bannerBlueEnd = Color(0xFF0D47A1);

  // ── Border & Divider ──
  static const Color border = Color(0xFFE5E7EB);
  static const Color divider = Color(0xFFF3F4F6);

  // ── Shadow ──
  static const Color shadow = Color(0x1A000000);
}
