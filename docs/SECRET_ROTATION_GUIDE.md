# 🔐 SECRET ROTATION GUIDE

> **Ngày tạo**: 2026-01-20  
> **Tình trạng**: ⚠️ CẦN ROTATE NGAY - Keys đã bị lộ trong docs

---

## 🚨 Keys Cần Rotate Ngay (P0)

### 1. Google Gemini API Key

**Bị lộ**: `AIzaSyCBWfOBox...` (trong API_STATUS_GUIDE.md - đã sanitize)

**Cách rotate**:

1. Vào [Google Cloud Console](https://console.cloud.google.com)
2. Chọn project: `thiết kế xây dựng (1075439753165)`
3. APIs & Services → Credentials
4. Tìm key Gemini, click "..." → Delete
5. Create Credentials → API Key
6. Restrict key: chỉ cho phép Gemini API
7. Copy key mới vào `.env`:
   ```
   GEMINI_API_KEY=<new_key>
   EXPO_PUBLIC_GEMINI_API_KEY=<new_key>
   ```

### 2. GetOTP API Key

**Bị lộ**: `b2c885626ab1e17735372aa843edb431`

**Cách rotate**:

1. Vào [GetOTP Dashboard](https://otp.dev/en/dashboard/)
2. Settings → API Keys
3. Revoke key cũ
4. Generate new API key
5. Update `.env`:
   ```
   EXPO_PUBLIC_GETOTP_API_KEY=<new_key>
   ```

### 3. Pinecone API Key

**Bị lộ**: `pcsk_zmziy_B2rqCqDD4y...`

**Cách rotate**:

1. Vào [Pinecone Console](https://app.pinecone.io)
2. API Keys → Delete old key
3. Create API Key
4. Update `.env`:
   ```
   PINECONE_API_KEY=<new_key>
   EXPO_PUBLIC_PINECONE_API_KEY=<new_key>
   ```

### 4. Procore Credentials

**Bị lộ**: Client ID và Client Secret

**Cách rotate**:

1. Vào [Procore Developer Portal](https://developers.procore.com)
2. Your Apps → Select app
3. Credentials → Regenerate Secret
4. Update `.env`:
   ```
   PROCORE_CLIENT_ID=<new_id>
   PROCORE_CLIENT_SECRET=<new_secret>
   ```

### 5. ExchangeRate API Key

**Bị lộ**: `9990a4b1154e45dfa3a508a5`

**Cách rotate**:

1. Vào [ExchangeRate-API](https://app.exchangerate-api.com/dashboard)
2. API Keys → Regenerate
3. Update `.env`:
   ```
   EXCHANGERATE_API_KEY=<new_key>
   EXPO_PUBLIC_EXCHANGERATE_API_KEY=<new_key>
   ```

---

## ✅ Checklist Sau Khi Rotate

- [ ] Đã rotate Gemini API Key
- [ ] Đã rotate GetOTP API Key
- [ ] Đã rotate Pinecone API Key
- [ ] Đã rotate Procore Credentials
- [ ] Đã rotate ExchangeRate API Key
- [ ] Đã update `.env` local
- [ ] Đã update `.env` staging
- [ ] Đã update `.env` production
- [ ] Đã restart backend services
- [ ] Đã test tất cả integrations
- [ ] Đã verify app hoạt động bình thường

---

## 🛡️ Phòng Ngừa Trong Tương Lai

### 1. Pre-commit Hook (Đã cài đặt)

```bash
# .husky/pre-commit tự động chặn commits chứa secrets
```

### 2. Gitleaks Config

```bash
# .gitleaks.toml định nghĩa patterns cần detect
```

### 3. Best Practices

- ❌ KHÔNG commit secrets vào repo
- ❌ KHÔNG copy secrets vào docs/markdown
- ✅ Dùng `.env` files (đã trong .gitignore)
- ✅ Dùng placeholders: `<YOUR_API_KEY>`
- ✅ Dùng secret manager trong production

---

## 📞 Liên Hệ Khẩn Cấp

Nếu phát hiện secret bị lộ:

1. Rotate key ngay lập tức
2. Check logs xem có unauthorized access không
3. Báo team qua Slack #security

---

_Last updated: 2026-01-20_
