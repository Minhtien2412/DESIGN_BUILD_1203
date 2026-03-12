# Hướng Dẫn Sử Dụng Chức Năng Gọi Điện & Nhắn Tin

## Tổng quan

Ứng dụng đã tích hợp chức năng **gọi điện** và **nhắn tin** giống như Zalo/Shopee, cho phép người dùng liên hệ trực tiếp với nhà thầu, thợ xây, thợ điện nước chỉ bằng một chạm.

## Các tính năng đã triển khai

### 1. **Phone Actions Utilities** (`utils/phone-actions.ts`)

#### Functions:

##### `makePhoneCall(phoneNumber: string)`
- Mở ứng dụng gọi điện native với số điện thoại
- Tự động format số điện thoại (loại bỏ dấu cách, dấu ngoặc)
- Kiểm tra khả năng gọi điện của thiết bị
- Hiển thị thông báo lỗi nếu không thể gọi

**Ví dụ:**
```typescript
import { makePhoneCall } from '@/utils/phone-actions';

makePhoneCall('090 111 2222');
// Mở dialer với số: 0901112222
```

##### `sendSMS(phoneNumber: string, message?: string)`
- Mở ứng dụng nhắn tin native
- Tự động điền số điện thoại và nội dung tin nhắn (nếu có)
- Hỗ trợ cả iOS và Android
- Platform-specific separator (`&` cho iOS, `?` cho Android)

**Ví dụ:**
```typescript
import { sendSMS } from '@/utils/phone-actions';

sendSMS('090 111 2222', 'Xin chào, tôi muốn tư vấn về dịch vụ xây dựng.');
// Mở SMS app với tin nhắn đã soạn sẵn
```

##### `showContactOptions(phoneNumber: string, name?: string)`
- Hiển thị Alert với 2 lựa chọn: Gọi điện hoặc Nhắn tin
- Tùy chọn hiển thị tên người liên hệ

**Ví dụ:**
```typescript
import { showContactOptions } from '@/utils/phone-actions';

showContactOptions('090 111 2222', 'Thợ Xây Minh Tuấn');
// Alert: "Chọn cách liên hệ với Thợ Xây Minh Tuấn"
//   - Gọi điện
//   - Nhắn tin
//   - Hủy
```

##### `openInMessagingApp(phoneNumber: string, app: 'whatsapp' | 'zalo')`
- Mở WhatsApp/Zalo với số điện thoại (nếu đã cài đặt)
- Fallback về SMS nếu app chưa cài

---

### 2. **Contact Action Buttons Component** (`components/ui/contact-action-buttons.tsx`)

Component UI có sẵn với 2 nút: **Gọi điện** (trắng viền đỏ) và **Liên hệ ngay** (đỏ).

#### Props:

| Prop | Type | Required | Default | Mô tả |
|------|------|----------|---------|-------|
| `phoneNumber` | `string` | ✅ | - | Số điện thoại liên hệ |
| `name` | `string` | ❌ | - | Tên người/dịch vụ (dùng trong SMS) |
| `smsMessage` | `string` | ❌ | Auto-generated | Nội dung tin nhắn tùy chỉnh |
| `buttonSize` | `'small' \| 'medium' \| 'large'` | ❌ | `'medium'` | Kích thước nút |
| `containerStyle` | `ViewStyle` | ❌ | - | Custom style cho container |

#### Ví dụ sử dụng:

```typescript
import { ContactActionButtons } from '@/components/ui/contact-action-buttons';

// Basic usage
<ContactActionButtons 
  phoneNumber="090 111 2222"
  name="Thợ Xây Minh Tuấn"
/>

// Custom SMS message
<ContactActionButtons 
  phoneNumber="091 222 3333"
  name="Điện Nước Thành Đạt"
  smsMessage="Tôi cần báo giá cho dự án xây nhà 2 tầng."
/>

// Large buttons
<ContactActionButtons 
  phoneNumber="092 333 4444"
  buttonSize="large"
/>

// Small buttons with custom style
<ContactActionButtons 
  phoneNumber="093 444 5555"
  buttonSize="small"
  containerStyle={{ marginTop: 12 }}
/>
```

---

### 3. **Màn hình đã tích hợp**

#### ✅ Thợ Xây (`app/utilities/tho-xay.tsx`)

**Vị trí:** Card thông tin thợ xây → Phần `priceRow`

**2 nút:**
1. **Gọi điện** (trắng viền đỏ) → Gọi trực tiếp
2. **Liên hệ ngay** (đỏ) → Mở SMS với nội dung: "Xin chào {name}, tôi muốn tư vấn về dịch vụ xây dựng."

**Code:**
```tsx
<View style={styles.actionButtons}>
  <TouchableOpacity 
    style={styles.callButton} 
    onPress={() => makePhoneCall(mason.phone)}
  >
    <Ionicons name="call-outline" size={20} color="#EE4D2D" />
    <Text style={styles.callButtonText}>Gọi điện</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={styles.contactButton} 
    onPress={() => sendSMS(mason.phone, `Xin chào ${mason.name}, tôi muốn tư vấn về dịch vụ xây dựng.`)}
  >
    <Ionicons name="chatbubble" size={20} color="#fff" />
    <Text style={styles.contactButtonText}>Liên hệ ngay</Text>
  </TouchableOpacity>
</View>
```

#### ✅ Thợ Điện Nước (`app/utilities/tho-dien-nuoc.tsx`)

**Vị trí:** Card thông tin thợ điện nước → Phần `priceRow`

**2 nút:**
1. **Gọi điện** (trắng viền đỏ) → Gọi trực tiếp
2. **Liên hệ ngay** (đỏ) → Mở SMS với nội dung: "Xin chào {name}, tôi muốn tư vấn về dịch vụ điện nước."

---

## Cách thêm vào màn hình mới

### Cách 1: Sử dụng Component (Khuyến nghị)

```tsx
import { ContactActionButtons } from '@/components/ui/contact-action-buttons';

// Trong JSX
<ContactActionButtons 
  phoneNumber={contractor.phone}
  name={contractor.name}
  smsMessage={`Xin chào ${contractor.name}, tôi cần tư vấn...`}
  buttonSize="medium"
/>
```

### Cách 2: Tự implement (Custom UI)

```tsx
import { makePhoneCall, sendSMS } from '@/utils/phone-actions';

// Nút gọi điện
<TouchableOpacity onPress={() => makePhoneCall(phone)}>
  <Ionicons name="call" size={24} color="#EE4D2D" />
  <Text>Gọi điện</Text>
</TouchableOpacity>

// Nút nhắn tin
<TouchableOpacity onPress={() => sendSMS(phone, 'Nội dung...')}>
  <Ionicons name="chatbubble" size={24} color="#fff" />
  <Text>Nhắn tin</Text>
</TouchableOpacity>
```

---

## URL Schemes sử dụng

| Tính năng | iOS | Android | Hỗ trợ |
|-----------|-----|---------|--------|
| **Gọi điện** | `tel:0901112222` | `tel:0901112222` | ✅ Universal |
| **Nhắn tin** | `sms:0901112222&body=...` | `sms:0901112222?body=...` | ✅ Platform-specific |
| **WhatsApp** | `whatsapp://send?phone=...` | `whatsapp://send?phone=...` | ✅ Nếu cài app |
| **Zalo** | `zalo://conversation?phone=...` | `zalo://conversation?phone=...` | ⚠️ Có thể thay đổi |

---

## Testing

### Test trên iOS Simulator:
```bash
# Lưu ý: iOS Simulator KHÔNG hỗ trợ gọi điện/SMS thực tế
# Nhưng vẫn có thể test UI và Alert

npm start
# Chọn iOS, nhấn nút "Gọi điện" sẽ thấy alert: 
# "Thiết bị không hỗ trợ chức năng gọi điện"
```

### Test trên thiết bị thật:
```bash
# Build APK hoặc cài qua Expo Go
npx expo start

# Quét QR code bằng Expo Go
# Nhấn "Gọi điện" → Mở native dialer
# Nhấn "Liên hệ ngay" → Mở SMS app với tin nhắn sẵn
```

---

## Styles

### Màu sắc theo Shopee/Lazada:

```typescript
const COLORS = {
  primary: '#EE4D2D',      // Màu đỏ chính (Shopee Orange)
  white: '#FFFFFF',
  border: '#EE4D2D',
  text: {
    primary: '#EE4D2D',
    white: '#FFFFFF',
  },
};
```

### Button Styles:

```typescript
callButton: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#EE4D2D',
  // Icon & Text: #EE4D2D
}

contactButton: {
  backgroundColor: '#EE4D2D',
  // Icon & Text: #FFFFFF
}
```

---

## Lỗi thường gặp

### 1. "Thiết bị không hỗ trợ chức năng gọi điện"
- **Nguyên nhân:** Chạy trên simulator hoặc tablet không có SIM
- **Giải pháp:** Test trên thiết bị thật có SIM

### 2. SMS không mở với nội dung
- **Nguyên nhân:** Separator sai (`?` vs `&`)
- **Giải pháp:** Đã tự động detect platform trong `sendSMS()`

### 3. Số điện thoại không format đúng
- **Nguyên nhân:** Có dấu cách, ngoặc đơn
- **Giải pháp:** Utils tự động clean: `phone.replace(/[\s()-]/g, '')`

---

## Roadmap

### 🔜 Tính năng tiếp theo:

1. **Lịch sử cuộc gọi** - Lưu log các cuộc gọi đã thực hiện
2. **Quick Actions** - Long press để copy số điện thoại
3. **Zalo/WhatsApp integration** - Mở app nếu đã cài
4. **VoIP calling** - Gọi điện qua internet (WebRTC)
5. **Chat trong app** - Không cần rời khỏi app

---

## Tài liệu liên quan

- [React Native Linking API](https://reactnative.dev/docs/linking)
- [URL Schemes List](https://github.com/phiture/react-native-app-link)
- [Expo Linking](https://docs.expo.dev/versions/latest/sdk/linking/)

---

## Liên hệ

**Developer:** Tien  
**Project:** APP_DESIGN_BUILD05.12.2025  
**Date:** 18/12/2025
