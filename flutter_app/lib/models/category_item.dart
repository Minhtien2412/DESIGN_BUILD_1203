import 'package:flutter/material.dart';

/// Data model for a category icon tile shown in grids.
/// Ready to be replaced with API response data.
class CategoryItem {
  final String id;
  final String label;
  final IconData icon;
  final Color iconColor;
  final Color backgroundColor;
  final String? route;

  const CategoryItem({
    required this.id,
    required this.label,
    required this.icon,
    this.iconColor = const Color(0xFF1A1A1A),
    this.backgroundColor = const Color(0xFFF5F5F5),
    this.route,
  });
}
