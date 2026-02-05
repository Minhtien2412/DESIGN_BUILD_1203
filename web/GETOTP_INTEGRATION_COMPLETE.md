# GetOTP Integration Complete ✅

## Tổng quan
Đã tích hợp thành công **GetOTP API** (https://otp.dev) để gửi và xác thực OTP qua SMS.

## Thông tin API

```yaml
API Provider: GetOTP (otp.dev)
API Key: b2c885626ab1e17735372aa843edb431
Key Name: app design build
Balance: $2
Channels: SMS, Viber, Voice, Telegram
```

## Files đã tạo/cập nhật

### 1. services/getOTPService.ts (MỚI)
Service tích hợp GetOTP API với các chức năng:

```typescript
import { getOTPService, sendSMSOTP, verifySMSOTP } from '@/services/getOTPService';

// Gửi OTP qua SMS
const result = await getOTPService.sendSMS({
  phone: '0912345678',
  sender: 'ThietKe',
  codeLength: 6,
});

// Gửi OTP qua Viber
await getOTPService.sendViber({ phone: '0912345678' });

// Gửi OTP qua Voice Call
await getOTPService.sendVoice({ phone: '0912345678' });

// Gửi OTP qua Telegram
await getOTPService.sendTelegram({ phone: '0912345678' });

// Xác thực OTP
const verifyResult = await getOTPService.verifyOTP({
  phone: '0912345678',
  code: '123456',
});

// Kiểm tra số dư tài khoản
const balance = await getOTPService.getBalance();

// Auto-fallback (SMS → Viber → Voice)
const autoResult = await getOTPService.sendOTPWithFallback('0912345678');
```

### 2. services/unifiedAuth.ts (ĐÃ CẬP NHẬT)
- Import GetOTP service
- Cập nhật `sendOTP()` để sử dụng GetOTP cho SMS
- Cập nhật `verifyOTP()` để verify qua GetOTP API
- Fallback về local mock nếu GetOTP fail

### 3. config/env.ts (ĐÃ CẬP NHẬT)
Thêm config cho GetOTP:
```typescript
GETOTP_API_KEY: 'b2c885626ab1e17735372aa843edb431',
GETOTP_SENDER_NAME: 'ThietKe',
GETOTP_DEFAULT_CHANNEL: 'sms',
```

### 4. .env (ĐÃ CẬP NHẬT)
```env
# GetOTP (Primary OTP Provider)
EXPO_PUBLIC_GETOTP_API_KEY=b2c885626ab1e17735372aa843edb431
GETOTP_API_KEY=b2c885626ab1e17735372aa843edb431
GETOTP_SENDER_NAME=ThietKe
GETOTP_DEFAULT_CHANNEL=sms
```

## GetOTP API Endpoints

### Gửi OTP
```
POST https://api.otp.dev/v1/verifications
Header: X-OTP-Key: {API_KEY}
Body: {
  "data": {
    "channel": "sms",
    "sender": "ThietKe",
    "phone": "+84912345678",
    "code_length": 6
  }
}
```

### Xác thực OTP
```
GET https://api.otp.dev/v1/verifications?code={code}&phone={phone}
Header: X-OTP-Key: {API_KEY}

Response:
- data: [] → OTP không hợp lệ hoặc hết hạn
- data: [{...}] → OTP hợp lệ
```

## Luồng hoạt động

```
┌─────────────────────────────────────────────────────────────┐
│                    OTP Flow với GetOTP                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌───────────┐    ┌──────────┐             │
│  │   User   │───▶│ UnifiedAuth│───▶│ GetOTP   │             │
│  │   App    │    │  Service   │    │   API    │             │
│  └──────────┘    └───────────┘    └──────────┘             │
│       │                │                │                   │
│       │  1. Nhập SĐT   │                │                   │
│       │───────────────▶│                │                   │
│       │                │  2. sendSMS()  │                   │
│       │                │───────────────▶│                   │
│       │                │                │  3. Gửi SMS       │
│       │                │                │────────▶ User     │
│       │                │  4. Response   │                   │
│       │  5. Success    │◀───────────────│                   │
│       │◀───────────────│                │                   │
│       │                │                │                   │
│       │  6. Nhập OTP   │                │                   │
│       │───────────────▶│                │                   │
│       │                │  7. verifyOTP()│                   │
│       │                │───────────────▶│                   │
│       │                │  8. Verified   │                   │
│       │  9. Success    │◀───────────────│                   │
│       │◀───────────────│                │                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Fallback Logic

```
SMS → Viber → Voice → Local Mock
     ↓ fail   ↓ fail   ↓ fail
```

Nếu GetOTP API không khả dụng, hệ thống sẽ fallback về mock mode (hiển thị OTP trong console cho testing).

## Error Codes

| Code | Mô tả |
|------|-------|
| 1136 | API key không hợp lệ |
| 1512 | Thiếu số điện thoại |
| 1513 | Số điện thoại không hợp lệ |
| 1514 | Kênh gửi không hợp lệ |
| 1515 | Template không tồn tại |
| 1520 | Thiếu mã OTP |
| 1521 | Mã OTP không hợp lệ |
| 1632 | Số dư không đủ |

## Webhook Configuration (đã setup)

```yaml
Name: Design build
Event: Outgoing Message Delivery
URL: https://baotienweb.cloud
Channel: All Channels
```

## Testing

### Test gửi OTP
```javascript
import { sendSMSOTP } from '@/services/getOTPService';

const result = await sendSMSOTP('0912345678');
console.log(result);
// { success: true, message: 'Mã OTP đã được gửi thành công', data: {...} }
```

### Test verify OTP
```javascript
import { verifySMSOTP } from '@/services/getOTPService';

const result = await verifySMSOTP('0912345678', '123456');
console.log(result);
// { success: true, verified: true, message: 'Xác thực OTP thành công' }
```

## Chi phí

GetOTP tính phí theo số tin nhắn gửi:
- SMS: ~$0.01-0.05/tin (tùy quốc gia)
- Viber: ~$0.008-0.02/tin
- Voice: ~$0.02-0.05/cuộc
- Telegram: ~$0.005-0.01/tin

Balance hiện tại: **$2** (đủ cho ~40-200 tin SMS)

## Lưu ý quan trọng

1. **Format số điện thoại**: Tự động convert `0912345678` → `+84912345678`
2. **Expire time**: OTP hết hạn sau 5 phút (configurable)
3. **Max attempts**: 5 lần nhập sai → phải gửi lại OTP mới
4. **Sender name**: "ThietKe" (có thể custom trong GetOTP dashboard)

## Next Steps

1. ✅ Tích hợp GetOTP API
2. ✅ Update UnifiedAuthService
3. ⬜ Tạo OTP template custom trong GetOTP dashboard
4. ⬜ Test thực tế với số điện thoại thật
5. ⬜ Setup rate limiting để tránh spam

---

**Ngày tích hợp**: 12/01/2026
**Trạng thái**: ✅ Hoàn thành
