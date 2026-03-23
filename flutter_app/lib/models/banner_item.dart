import 'package:flutter/material.dart';

/// Data model for hero and promotional banners.
class BannerItem {
  final String id;
  final String title;
  final String? subtitle;
  final String? ctaText;
  final String? imageUrl;
  final Color startColor;
  final Color endColor;
  final Color textColor;
  final String? route;

  const BannerItem({
    required this.id,
    required this.title,
    this.subtitle,
    this.ctaText,
    this.imageUrl,
    this.startColor = const Color(0xFFFF6B35),
    this.endColor = const Color(0xFFE84C2B),
    this.textColor = Colors.white,
    this.route,
  });

  factory BannerItem.fromJson(Map<String, dynamic> json) {
    return BannerItem(
      id: json['id'] as String,
      title: json['title'] as String,
      subtitle: json['subtitle'] as String?,
      ctaText: json['ctaText'] as String?,
      imageUrl: json['imageUrl'] as String?,
    );
  }
}
