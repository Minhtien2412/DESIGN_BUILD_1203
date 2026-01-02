#!/bin/bash
# Script để gửi thông báo thử từ máy khác (Linux/Mac)
# Sử dụng API backend: https://baotienweb.cloud/api/v1/notifications

BASE_URL="https://baotienweb.cloud/api/v1"

# Thông tin đăng nhập (thay đổi nếu cần)
EMAIL="test@baotien.com"
PASSWORD="Test@123"

echo "=== GỬI THÔNG BÁO THỬ ==="
echo ""

# Bước 1: Đăng nhập để lấy token
echo "[1] Đăng nhập để lấy token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "✗ Lỗi đăng nhập!"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✓ Đăng nhập thành công!"
echo ""

# Bước 2: Menu chọn loại thông báo
echo "[2] Chọn loại thông báo muốn gửi:"
echo "  1. Tin nhắn (Message)"
echo "  2. Cuộc gọi (Call)"
echo "  3. Thông báo hệ thống (System)"
echo "  4. Sự kiện (Event)"
echo "  5. Live stream (Live)"
echo ""
read -p "Nhập số (1-5): " choice

# Chuẩn bị notification data
case $choice in
    1)
        NOTIFICATION_DATA='{
            "type": "IN_APP",
            "title": "💬 Tin nhắn mới từ Nguyễn Văn A",
            "body": "Chào bạn! Dự án của chúng ta tiến triển như thế nào rồi?",
            "priority": "HIGH",
            "metadata": "{\"category\":\"message\",\"messageType\":\"chat\",\"senderName\":\"Nguyễn Văn A\",\"senderAvatar\":\"https://i.pravatar.cc/150?img=12\",\"preview\":\"Chào bạn! Dự án của chúng ta...\",\"conversationId\":\"conv_123\"}"
        }'
        DISPLAY_NAME="Tin nhắn"
        ;;
    2)
        NOTIFICATION_DATA='{
            "type": "PUSH",
            "title": "📞 Cuộc gọi nhớ từ Trần Thị B",
            "body": "Bạn có 1 cuộc gọi nhớ",
            "priority": "URGENT",
            "metadata": "{\"category\":\"call\",\"callType\":\"voice\",\"callerName\":\"Trần Thị B\",\"callerAvatar\":\"https://i.pravatar.cc/150?img=5\",\"duration\":\"00:00\",\"missedCall\":true}"
        }'
        DISPLAY_NAME="Cuộc gọi"
        ;;
    3)
        NOTIFICATION_DATA='{
            "type": "IN_APP",
            "title": "🔔 Cập nhật hệ thống",
            "body": "Hệ thống sẽ bảo trì vào 2:00 AM ngày mai. Vui lòng lưu công việc.",
            "priority": "MEDIUM",
            "metadata": "{\"category\":\"system\",\"systemType\":\"maintenance\"}"
        }'
        DISPLAY_NAME="Hệ thống"
        ;;
    4)
        NOTIFICATION_DATA='{
            "type": "IN_APP",
            "title": "🎉 Sự kiện sắp diễn ra",
            "body": "Cuộc họp nhóm dự án bắt đầu sau 15 phút",
            "priority": "HIGH",
            "metadata": "{\"category\":\"event\",\"eventType\":\"meeting\",\"eventName\":\"Cuộc họp nhóm dự án\",\"location\":\"Phòng họp A\",\"attendees\":5}"
        }'
        DISPLAY_NAME="Sự kiện"
        ;;
    5)
        NOTIFICATION_DATA='{
            "type": "PUSH",
            "title": "🎥 Phát trực tiếp đang diễn ra",
            "body": "Nguyễn Văn C đang phát trực tiếp: Hướng dẫn React Native",
            "priority": "HIGH",
            "metadata": "{\"category\":\"live\",\"liveType\":\"stream\",\"streamerName\":\"Nguyễn Văn C\",\"streamerAvatar\":\"https://i.pravatar.cc/150?img=8\",\"viewerCount\":245,\"isActive\":true}"
        }'
        DISPLAY_NAME="Live stream"
        ;;
    *)
        echo "✗ Lựa chọn không hợp lệ!"
        exit 1
        ;;
esac

# Bước 3: Gửi thông báo
echo ""
echo "[3] Đang gửi thông báo '$DISPLAY_NAME'..."

RESPONSE=$(curl -s -X POST "$BASE_URL/notifications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$NOTIFICATION_DATA")

if echo "$RESPONSE" | grep -q '"id"'; then
    echo "✓ Thông báo đã được gửi thành công!"
    echo ""
    echo "Chi tiết:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "📱 Kiểm tra app để xem thông báo!"
else
    echo "✗ Lỗi khi gửi thông báo:"
    echo "$RESPONSE"
fi

echo ""
echo "=== HOÀN TẤT ==="
