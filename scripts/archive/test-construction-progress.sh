#!/bin/bash
# Quick test script for Construction Progress feature

echo "🏗️  Testing Construction Progress Feature"
echo "========================================"

# 1. Check if files exist
echo ""
echo "1️⃣  Checking files..."
files=(
  "app/construction-progress.tsx"
  "components/ui/construction-progress-card.tsx"
  "hooks/useConstructionProgress.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file (MISSING)"
  fi
done

# 2. Check imports in home screen
echo ""
echo "2️⃣  Checking home screen integration..."
if grep -q "ConstructionProgressCard" "app/(tabs)/index.tsx"; then
  echo "   ✅ Card component imported"
else
  echo "   ❌ Card component NOT imported"
fi

if grep -q "useConstructionProgress" "app/(tabs)/index.tsx"; then
  echo "   ✅ Hook imported"
else
  echo "   ❌ Hook NOT imported"
fi

# 3. Check AsyncStorage package
echo ""
echo "3️⃣  Checking dependencies..."
if grep -q "@react-native-async-storage/async-storage" "package.json"; then
  echo "   ✅ AsyncStorage installed"
else
  echo "   ❌ AsyncStorage NOT installed"
fi

# 4. Manual test checklist
echo ""
echo "📋 Manual Test Checklist:"
echo "========================="
echo ""
echo "Home Screen:"
echo "  [ ] Card hiển thị trên trang chủ"
echo "  [ ] Progress % hiển thị đúng"
echo "  [ ] Số task completed/total đúng"
echo "  [ ] Chạm vào card → navigate sang màn hình chi tiết"
echo ""
echo "Construction Progress Screen:"
echo "  [ ] Header hiển thị đúng"
echo "  [ ] 4 giai đoạn hiển thị đầy đủ"
echo "  [ ] Kanban board với 4 cột"
echo "  [ ] Progress bar cho từng cột"
echo "  [ ] Tasks hiển thị đúng cột"
echo "  [ ] Màu sắc trạng thái đúng"
echo ""
echo "Add Task:"
echo "  [ ] Chạm FAB button (+)"
echo "  [ ] Modal mở lên"
echo "  [ ] Nhập tên task"
echo "  [ ] Chọn giai đoạn"
echo "  [ ] Thêm ghi chú"
echo "  [ ] Submit → task xuất hiện trong cột tương ứng"
echo ""
echo "Update Task:"
echo "  [ ] Chạm vào task card"
echo "  [ ] Modal chi tiết mở"
echo "  [ ] Đổi trạng thái → progress tự động update"
echo "  [ ] Đổi giai đoạn → task chuyển cột"
echo "  [ ] Sửa ghi chú → lưu thành công"
echo ""
echo "Delete Task:"
echo "  [ ] Chọn task"
echo "  [ ] Cuộn xuống dưới modal"
echo "  [ ] Chạm 'Xóa hạng mục'"
echo "  [ ] Confirm → task biến mất"
echo ""
echo "Data Persistence:"
echo "  [ ] Thêm/sửa task"
echo "  [ ] Tắt app"
echo "  [ ] Mở lại → data vẫn còn"
echo ""
echo "Pull to Refresh:"
echo "  [ ] Kéo xuống trên home"
echo "  [ ] Progress card cập nhật"
echo ""
echo "🎯 Test Commands:"
echo "================="
echo ""
echo "# Reload app"
echo "r"
echo ""
echo "# Clear cache and restart"
echo "npm run clean:cache"
echo ""
echo "# TypeScript check"
echo "npm run typecheck"
echo ""
echo "✨ Happy Testing!"
