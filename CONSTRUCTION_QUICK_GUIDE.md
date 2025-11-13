# 🏗️ Construction App - Quick Reference

## 📱 What Changed?

### Before (Grab-like):
- 🚗 Ride booking (GrabCar)
- 🍔 Food delivery (GrabFood)
- 👤 Driver tracking
- ⭐ Driver ratings

### After (Construction):
- 🔧 **Service booking** (Thợ xây, điện, nước, sơn)
- 🛒 **Materials shopping** (thiết bị, vật liệu)
- 👷 **Worker tracking** (theo dõi thợ)
- ⭐ **Service ratings** (đánh giá dịch vụ)

---

## 🗺️ New File Structure

```
app/
├── construction/              # NEW
│   ├── booking.tsx           # ✅ Service booking (thay ride)
│   └── tracking.tsx          # ✅ Worker tracking (thay driver tracking)
│
├── materials/                 # TODO (từ food/)
│   ├── index.tsx             # Browse suppliers
│   ├── supplier/[id].tsx     # Product catalog
│   ├── cart.tsx              # Shopping cart
│   └── delivery-tracking.tsx # Delivery tracking
│
├── construction-old-backup/   # Backup Grab ride
│   ├── index.tsx
│   └── tracking.tsx
│
└── food/                      # TODO: Convert to materials
    ├── index.tsx
    ├── restaurant/[id].tsx
    └── order-tracking.tsx
```

---

## 🎯 How to Test New Features

### 1. Service Booking:
```bash
Navigate to: /construction/booking

Steps:
1. Chọn loại thợ (Xây/Điện/Nước/Sơn)
2. Nhập địa chỉ công trường
3. Chọn số ngày làm việc
4. Nhập mô tả công việc
5. (Optional) Áp dụng mã giảm giá:
   - BUILD15 = giảm 15%
   - NEWYEAR = giảm 20%
6. Chọn thanh toán (Tiền mặt/Chuyển khoản)
7. Tap "Đặt Dịch Vụ"

Expected: Navigate to tracking screen
```

### 2. Worker Tracking:
```bash
Navigate to: /construction/tracking

Auto-simulation:
- 0s: Finding worker
- 3s: Worker accepted
- 6s: Worker traveling
- 10s: Worker working
- 15s: Work completed

Actions available:
- Call worker (show alert with phone)
- Chat worker (navigate to /messages)
- Cancel service (confirmation dialog)
- Rate service (after completion)
```

---

## 🔧 Worker Types Available

| Type | Icon | Price/Day | Description |
|------|------|-----------|-------------|
| Thợ Xây | 🧱 | 500,000đ | Xây tường, đổ bê tông, làm móng |
| Thợ Điện | ⚡ | 600,000đ | Lắp đặt hệ thống điện, sửa chữa |
| Thợ Nước | 🚰 | 550,000đ | Lắp đặt ống nước, sửa chữa |
| Thợ Sơn | 🎨 | 450,000đ | Sơn tường, sơn cửa, hoàn thiện |

---

## 💰 Promo Codes

| Code | Discount | Description |
|------|----------|-------------|
| BUILD15 | 15% | Giảm 15% tổng chi phí |
| NEWYEAR | 20% | Giảm 20% dịch vụ mới |

---

## 📊 Home Screen Data (Already Correct!)

### DỊCH VỤ (11 services):
1. Thiết kế nhà
2. Thiết kế nội thất
3. Tra cứu xây dựng
4. Xin phép
5. Hồ sơ mẫu
6. Lỗ ban
7. Bảng mẫu
8. Tư vấn chất lượng
9. Công ty xây dựng
10. Công ty nội thất
11. Giám sát chất lượng

### TIỆN ÍCH XÂY DỰNG (8 utilities):
1. Ép cọc - Hà Nội (100)
2. Đào đất - Sài Gòn (50)
3. Vật liệu - Đà Nẵng (80)
4. Nhân công - Sài Gòn (60)
5. Thợ xây - Hà Nội (78)
6. Thợ coffa - Sài Gòn (97)
7. Thợ điện nước - Cần Thơ (50)
8. Bê tông - Sài Gòn (90)

### TIỆN ÍCH HOÀN THIỆN (8 utilities):
1. Thợ lát gạch - Hà Nội (100)
2. Thợ thạch cao - Sài Gòn (60)
3. Thợ sơn - Đà Nẵng (85)
4. Thợ đá - Sài Gòn (70)
5. Thợ làm cửa - Hà Nội (68)
6. Thợ lan can - Sài Gòn (95)
7. Thợ công - Cần Thơ (40)
8. Thợ camera - Sài Gòn (70)

### MUA SẮM THIẾT BỊ (8 categories):
1. Thiết bị bếp
2. Thiết bị vệ sinh
3. Điện
4. Nước
5. PCCC
6. Bàn ăn
7. Bàn học
8. Sofa

### THƯ VIỆN (7 types):
1. Văn phòng
2. Nhà phố
3. Biệt thự
4. Biệt thự cổ điển
5. Khách sạn
6. Nhà xưởng
7. Căn hộ dịch vụ

### TIỆN ÍCH THIẾT KẾ (7 services):
1. Kiến trúc sư - 100k
2. Kỹ sư giám sát - 80k
3. Kỹ sư kết cấu - 90k
4. Kỹ sư điện - 70k
5. Kỹ sư nước - 70k
6. Dự toán - 60k
7. Nội thất - 100k

---

## 🚀 Next Features to Add

### 1. Link Home Screen to Booking
```typescript
// In app/(tabs)/index.tsx
// Update onPress handlers:

const handleUtilityPress = (item) => {
  router.push('/construction/booking');
};
```

### 2. Create Materials Shopping
```
Convert:
- app/food/index.tsx → app/materials/index.tsx
- Replace restaurants → suppliers
- Replace food → construction materials
```

### 3. Add Progress & Payment
```
Create:
- app/construction/progress.tsx
- Features:
  - Milestone timeline
  - Payment stages (30% - 40% - 30%)
  - Photo upload
  - Invoice generation
```

---

## 💡 Development Tips

### Quick Navigation:
```typescript
// Navigate to booking
router.push('/construction/booking');

// Navigate to tracking
router.push('/construction/tracking');

// Navigate with params
router.push({
  pathname: '/construction/booking',
  params: { workerType: 'mason' }
});
```

### Testing Promo Codes:
```typescript
// In booking screen, type:
"BUILD15"  // 15% discount
"NEWYEAR"  // 20% discount
```

### Simulate Status Changes:
```typescript
// In tracking.tsx, adjust delays:
const statusSequence = [
  { status: 'finding', delay: 0 },
  { status: 'accepted', delay: 1000 },  // Faster
  { status: 'traveling', delay: 2000 },
  // ...
];
```

---

## 🐛 Known Issues / Limitations

1. **Maps are placeholders** - Need Google Maps integration
2. **Payment not real** - Mock payment methods only
3. **Worker data is mock** - Need real API connection
4. **Chat/Rating screens exist** - Just need label updates

---

## 📝 Code Examples

### Worker Selection:
```typescript
const WORKER_TYPES: WorkerType[] = [
  {
    id: 'mason',
    name: 'Thợ Xây',
    icon: '🧱',
    basePrice: 500000,
    unit: 'ngày',
    description: 'Xây tường, đổ bê tông',
  },
  // ...
];
```

### Price Calculation:
```typescript
const calculatePrice = () => {
  const days = parseInt(workDays) || 1;
  const baseTotal = selectedWorker.basePrice * days;
  const discount = appliedPromo 
    ? (baseTotal * appliedPromo.discount) / 100 
    : 0;
  return baseTotal - discount;
};
```

### Status Tracking:
```typescript
type WorkStatus = 
  | 'finding'     // Đang tìm thợ
  | 'accepted'    // Đã chấp nhận
  | 'traveling'   // Đang đến
  | 'working'     // Đang làm việc
  | 'completed';  // Hoàn thành
```

---

## 🎨 UI/UX Patterns

### Animations:
- ✅ Scale on press (worker cards)
- ✅ Spring animations (selections)
- ✅ Progress bar fills
- ✅ Pulse effects (active worker pin)

### Colors:
- Primary: `#00B14F` (green)
- Danger: `#FF6B35` (red)
- Warning: `#FFC107` (yellow)
- Background: `#f5f5f5` (light gray)

### Components:
- Cards with shadows
- Rounded corners (8-12px)
- Icon buttons (44x44px)
- Bottom sheets for actions

---

## 🔄 Restore Grab Features

If you need original Grab features:

```bash
# Restore from backup
git checkout grab-features-backup

# Or access backed up files
app/construction-old-backup/index.tsx     # Original ride booking
app/construction-old-backup/tracking.tsx  # Original driver tracking
```

---

## ✅ Testing Checklist

- [ ] Book service with each worker type
- [ ] Apply both promo codes
- [ ] Test both payment methods
- [ ] Watch full status progression
- [ ] Call worker action
- [ ] Chat worker action
- [ ] Cancel service with confirmation
- [ ] Rate service after completion
- [ ] Check price calculations
- [ ] Verify input validations

---

**Quick Start:** Run `npm start` and navigate to `/construction/booking`! 🚀
