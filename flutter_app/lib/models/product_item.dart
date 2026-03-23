/// Data model for a product card (furniture, equipment, etc.).
/// Designed for easy JSON serialization when connecting to API.
class ProductItem {
  final String id;
  final String name;
  final String? imageUrl;
  final double price;
  final double? originalPrice;
  final int soldCount;
  final double? rating;

  const ProductItem({
    required this.id,
    required this.name,
    this.imageUrl,
    required this.price,
    this.originalPrice,
    this.soldCount = 0,
    this.rating,
  });

  /// Format price in Vietnamese style: 1.200.000đ
  String get formattedPrice {
    final priceInt = price.toInt();
    final formatted = priceInt.toString().replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (match) => '${match[1]}.',
    );
    return '${formatted}đ';
  }

  /// Format sold count: "Đã bán 1.2k" or "Đã bán 856"
  String get formattedSoldCount {
    if (soldCount >= 1000) {
      return 'Đã bán ${(soldCount / 1000).toStringAsFixed(1)}k';
    }
    return 'Đã bán $soldCount';
  }

  /// Factory for JSON deserialization (ready for API)
  factory ProductItem.fromJson(Map<String, dynamic> json) {
    return ProductItem(
      id: json['id'] as String,
      name: json['name'] as String,
      imageUrl: json['imageUrl'] as String?,
      price: (json['price'] as num).toDouble(),
      originalPrice: (json['originalPrice'] as num?)?.toDouble(),
      soldCount: json['soldCount'] as int? ?? 0,
      rating: (json['rating'] as num?)?.toDouble(),
    );
  }
}
