/// Data model for live streams and video content cards.
class LiveItem {
  final String id;
  final String title;
  final String? thumbnailUrl;
  final bool isLive;
  final int viewCount;
  final String? hostName;

  const LiveItem({
    required this.id,
    required this.title,
    this.thumbnailUrl,
    this.isLive = false,
    this.viewCount = 0,
    this.hostName,
  });

  String get formattedViewCount {
    if (viewCount >= 1000) {
      return '${(viewCount / 1000).toStringAsFixed(1)}k';
    }
    return '$viewCount';
  }

  factory LiveItem.fromJson(Map<String, dynamic> json) {
    return LiveItem(
      id: json['id'] as String,
      title: json['title'] as String,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      isLive: json['isLive'] as bool? ?? false,
      viewCount: json['viewCount'] as int? ?? 0,
      hostName: json['hostName'] as String?,
    );
  }
}
