# 🚀 Quick Start Guide - Grab-like Features

## Chạy ứng dụng

```bash
npm start
```

Sau đó nhấn:
- `a` để mở Android
- `i` để mở iOS  
- `w` để mở Web

---

## 🗺️ Feature Map - Đi đâu để test gì?

### 1. 🚗 Đặt xe (GrabCar)
```
Route: /ride
Hoặc: Từ home → tap "Ride" card
```

**Test flow:**
1. Nhập địa chỉ đón/trả
2. Chọn loại xe (4 options)
3. Nhập mã GRAB15 → giảm 15%
4. Tap "Đặt xe"
5. Xem tracking simulation

**Expected behavior:**
- Giá thay đổi khi đổi loại xe
- Discount áp dụng khi nhập code
- Animation cho vehicle selection
- Navigate to tracking sau khi book

---

### 2. 🚴 Theo dõi xe (Driver Tracking)
```
Route: /ride/tracking
Auto navigate sau khi book ride
```

**Test flow:**
1. Xem map với driver marker (bounce animation)
2. Quan sát 5 trạng thái auto-change:
   - Finding → Accepted → Arriving → On board → Completed
3. Tap "Chat" → navigate to messages
4. Tap "Call" → alert số điện thoại
5. Tap "Cancel" → confirmation dialog

**Expected behavior:**
- Progress bar update theo status
- ETA countdown (15 → 0 mins)
- Driver card hiện khi accepted
- Pulse animation ở active step

---

### 3. 🍔 Duyệt đồ ăn (Food Browse)
```
Route: /food
Hoặc: Từ home → tap "Food" card
```

**Test flow:**
1. Tap location selector (top)
2. Type in search bar
3. Scroll categories horizontally
4. Tap category chip → filter restaurants
5. Tap restaurant card → detail

**Expected behavior:**
- Category filter works
- Promo banner animates (fade + slide)
- Restaurant cards show correct info
- Cart badge updates when add items

---

### 4. 🍜 Chi tiết nhà hàng (Restaurant Menu)
```
Route: /food/restaurant/[id]
Auto navigate khi tap restaurant card
```

**Test flow:**
1. Scroll down → header fades in
2. Tap category chip → filter menu
3. Tap + button → add item
4. Increase/decrease quantity
5. Scroll down → floating cart button appears
6. Tap "Xem giỏ hàng" → checkout

**Expected behavior:**
- Header opacity changes with scroll
- Cart button scales khi add item
- Quantity controls work correctly
- Total price updates real-time
- Success alert with "Theo dõi đơn hàng"

---

### 5. 📦 Theo dõi đơn hàng (Order Tracking)
```
Route: /food/order-tracking
Auto navigate sau khi checkout
```

**Test flow:**
1. Xem map với animated driver pin
2. Quan sát timeline progression:
   - Preparing → Ready → Picked up → Delivering → Delivered
3. Driver card hiện khi "Picked up"
4. Tap Call/Chat buttons
5. Khi "Delivered" → tap "Đánh giá"

**Expected behavior:**
- Progress bar fills tự động
- Active step pulse animation
- Driver pin bounces on map
- Cancel button → confirmation
- Rating button → alert (hoặc navigate rating)

---

### 6. 💬 Chat với tài xế/nhà hàng
```
Route: /messages
Hoặc: Tap chat button từ tracking screens
```

**Test flow:**
1. Quan sát messages load
2. Xem typing indicator (3 animated dots)
3. Type message → tap send
4. Tap quick reply buttons (👍👌🙏)
5. Tap attachment button
6. Scroll to observe status changes:
   - ✓ (sent) → ✓✓ (delivered) → ✓✓ (blue/seen)

**Expected behavior:**
- Own messages: right, green
- Other messages: left, gray
- Typing indicator animates
- Status icons update
- Auto-scroll to bottom

---

### 7. ⭐ Đánh giá & Review
```
Component: RatingReviewScreen
Currently: Alert from order tracking
```

**Test flow:**
1. Tap stars (1-5) → animation
2. Select rating chips (multi-select)
3. Type comment (max 500 chars)
4. Tap quick comment buttons
5. Tap "Thêm ảnh" → select photos (max 5)
6. Tap "Gửi đánh giá"

**Expected behavior:**
- Stars scale on tap
- Active star glow effect
- Character counter updates
- Photo grid layout
- Submit shows loading
- Success feedback

---

## 🎨 Animation Showcase

### Driver Tracking:
- Pulse animation: Active timeline step
- Bounce: Driver marker on map
- Fade: Status updates

### Restaurant Menu:
- Parallax: Hero image scrolls slower
- Scale: Cart button when add item
- Fade: Header opacity on scroll

### Chat:
- Fade in: New messages
- Bounce: Typing indicator dots
- Slide: Message bubbles

### Rating:
- Spring: Star selection
- Scale: Active chips
- Fade: Success overlay

---

## 🐛 Known Issues / Limitations

### Maps:
- Currently placeholder views (colored boxes)
- Need Google Maps SDK integration
- No real geolocation

### Chat:
- Mock conversation only
- No real WebSocket connection
- Simulated typing/status updates

### Payments:
- No actual payment processing
- Mock payment methods

### Images:
- Using picsum.photos placeholders
- Need real restaurant/food images

---

## 🔧 Customization

### Change Grab Green Color:
```tsx
// Find and replace #00B14F with your color
```

### Add Real Maps:
```bash
npm install react-native-maps
```
Replace map placeholders in:
- `app/ride/tracking.tsx`
- `app/food/order-tracking.tsx`

### Add Real Chat:
```bash
npm install socket.io-client
```
Connect in `components/chat/ChatScreen.tsx`

### Add Real Payments:
```bash
npm install @stripe/stripe-react-native
```
Integrate in checkout flow

---

## 📊 Mock Data Locations

### Restaurants:
```tsx
// app/food/index.tsx
const MOCK_RESTAURANTS = [...]
```

### Menu Items:
```tsx
// app/food/restaurant/[id].tsx
const MOCK_MENU = [...]
```

### Driver Info:
```tsx
// app/ride/tracking.tsx
const MOCK_DRIVER = {...}
```

### Chat Messages:
```tsx
// components/chat/ChatScreen.tsx
const [messages, setMessages] = useState([...])
```

---

## 🎯 Testing Checklist

- [ ] Book ride with all vehicle types
- [ ] Apply promo code GRAB15
- [ ] Watch full driver tracking simulation
- [ ] Browse restaurants by category
- [ ] Add/remove items from menu
- [ ] Checkout with cart
- [ ] Watch full order tracking simulation
- [ ] Send messages in chat
- [ ] Rate with 1-5 stars
- [ ] Upload review photos
- [ ] Cancel order (confirmation works)
- [ ] Call driver (alert shows)

---

## 💡 Pro Tips

1. **Fast Testing:** Giảm timeout intervals trong simulation code (từ 3000ms → 1000ms)

2. **See All States:** Log state changes:
```tsx
useEffect(() => {
  console.log('Status:', status);
}, [status]);
```

3. **Debug Animations:** Slow down animations:
```tsx
Animated.timing(value, {
  duration: 5000, // was 500
  ...
})
```

4. **Mock Data:** Thêm dữ liệu test của bạn vào các MOCK arrays

---

## 🚀 Deploy to Production

### Before Launch:
1. Replace all mock data with API calls
2. Integrate real map services
3. Add authentication
4. Connect payment gateway
5. Setup push notifications
6. Add error tracking (Sentry)
7. Performance testing
8. Security audit

### Build Commands:
```bash
# Android APK
eas build --platform android --profile preview

# iOS IPA
eas build --platform ios --profile preview

# Production
eas build --platform all --profile production
```

---

## 📞 Support

Nếu có vấn đề:
1. Check console for errors
2. Clear cache: `npm start -- --clear`
3. Reinstall: `rm -rf node_modules && npm install`
4. Check React Native version compatibility

---

**Happy Testing! 🎉**

All features work out of the box. No backend required for testing. Just run and explore!
