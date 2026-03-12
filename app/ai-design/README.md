# AI Design Studio - Perfex CRM AI Architect Integration

Tính năng thiết kế AI tích hợp Google Gemini cho ứng dụng React Native.

## 🎯 Tính năng

### 1. AI Consultant (`/ai-design/consultant`)
- Chat với AI để nhận tư vấn về:
  - Kiến trúc hệ thống
  - Database design
  - Tư vấn công nghệ & framework
  - Giải pháp kỹ thuật cho dự án xây dựng
  - Best practices & optimization
- Gợi ý câu hỏi thông minh
- Lịch sử chat với timestamp

### 2. Architecture Diagram Generator (`/ai-design/architecture`)
- Tạo sơ đồ kiến trúc hệ thống tự động
- Hỗ trợ 3 styles: Modern, Classic, Minimal
- Chọn components phổ biến:
  - API Gateway, Load Balancer
  - Web/App Server, Database
  - Cache (Redis), Message Queue
  - File Storage, CDN, Authentication
- Export SVG
- Zoom & pan để xem chi tiết

### 3. Code Implementation Generator (`/ai-design/implementation`)
- Tạo code tự động với best practices
- Hỗ trợ 4 ngôn ngữ:
  - TypeScript (React Native, Next.js, NestJS, Express)
  - JavaScript (React, Vue, Node.js)
  - Python (Django, Flask, FastAPI, Pandas)
  - PHP (Laravel, Symfony, CodeIgniter, Perfex CRM)
- Tùy chọn bao gồm unit tests
- Copy to clipboard & export file
- Syntax highlighting

### 4. Design Visualizer (`/ai-design/visualizer`)
- **Đang phát triển** - Cần tích hợp Imagen API
- Tạo hình ảnh thiết kế từ text prompt
- Aspect ratios: 1:1, 16:9, 9:16, 4:3...
- Quality: 1K, 2K, 4K
- Crop, zoom, export

### 5. Design Analyzer (`/ai-design/analyzer`)
- Upload hoặc chụp ảnh thiết kế
- AI phân tích và đưa ra:
  - Mô tả chi tiết
  - Phong cách kiến trúc/design
  - Màu sắc chủ đạo
  - Điểm mạnh & cần cải thiện
  - Gợi ý tối ưu hóa
- Hỗ trợ: Kiến trúc, nội thất, landscape, floor plans

## 📦 Dependencies

```json
{
  "@google/genai": "^1.35.0",
  "expo-clipboard": "latest",
  "expo-file-system": "latest",
  "expo-image-picker": "latest",
  "expo-sharing": "latest",
  "react-native-webview": "latest"
}
```

## ⚙️ Cấu hình

### 1. Lấy Gemini API Key

1. Truy cập https://makersuite.google.com/app/apikey
2. Tạo API key mới
3. Copy key

### 2. Cập nhật `.env`

```bash
# Google Gemini AI
GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
EXPO_PUBLIC_GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### 3. Kiểm tra `config/env.ts`

File này đã được cấu hình sẵn để đọc `GEMINI_API_KEY` từ environment variables.

## 🚀 Sử dụng

### Trong ứng dụng:

1. Navigate đến "AI Design Studio" từ menu chính
2. Chọn module phù hợp:
   - **Consultant**: Chat tư vấn
   - **Architecture**: Tạo sơ đồ kiến trúc
   - **Implementation**: Generate code
   - **Visualizer**: Tạo hình ảnh (coming soon)
   - **Analyzer**: Phân tích ảnh thiết kế

### Programmatically:

```typescript
import geminiService from '@/services/geminiService';

// Chat với AI
const response = await geminiService.chatWithAI(messages, 'Tư vấn kiến trúc microservices');

// Tạo sơ đồ
const svg = await geminiService.generateArchitectureDiagram({
  description: 'Hệ thống quản lý dự án xây dựng',
  style: 'modern',
  components: ['API Gateway', 'Database', 'Cache'],
});

// Generate code
const code = await geminiService.generateCodeImplementation({
  feature: 'API upload documents với S3',
  language: 'typescript',
  framework: 'NestJS',
  includeTests: true,
});

// Phân tích ảnh
const analysis = await geminiService.analyzeDesignImage(imageBase64, 'Đánh giá thiết kế này');
```

## 📁 Cấu trúc Files

```
services/
  geminiService.ts          # Gemini AI service layer

app/ai-design/
  index.tsx                 # Hub screen với 5 modules
  consultant.tsx            # AI chat consultant
  architecture.tsx          # Architecture diagram generator
  implementation.tsx        # Code generator
  visualizer.tsx            # Design image generator (TODO)
  analyzer.tsx              # Design image analyzer
  
  README.md                 # Documentation (this file)
```

## 🎨 UI/UX Features

- **Gradient Cards**: Mỗi module có màu gradient riêng
- **Dark Mode Support**: Tự động adapt với theme
- **Loading States**: ActivityIndicator khi processing
- **Error Handling**: Alert với thông báo lỗi rõ ràng
- **Export Options**: Copy, share, save to file
- **Responsive**: Hoạt động tốt trên mọi kích thước màn hình

## 🔧 Advanced Configuration

### Custom Gemini Models

Mặc định sử dụng `gemini-2.0-flash-exp`. Có thể customize trong `geminiService.ts`:

```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp', // or 'gemini-pro', 'gemini-pro-vision'
  generationConfig: {
    temperature: 0.7,    // Creativity (0-1)
    topP: 0.95,          // Diversity
    maxOutputTokens: 2048, // Max response length
  }
});
```

### Safety Settings

```typescript
safetySettings: [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]
```

## 🐛 Troubleshooting

### Lỗi "API Key not configured"
- Kiểm tra `.env` có `GEMINI_API_KEY`
- Restart Metro bundler: `npx expo start -c`

### Lỗi "Failed to generate"
- Kiểm tra kết nối internet
- Verify API key còn valid
- Check quota tại Google AI Studio

### SVG không hiển thị
- Đảm bảo có `react-native-webview` installed
- Check console logs để xem SVG markup

### Image upload không hoạt động
- Grant camera/library permissions
- Check `expo-image-picker` configuration

## 📊 API Limits

**Google Gemini Free Tier:**
- 60 requests/minute
- 1,500 requests/day
- Upgrade lên paid plan để tăng limit

## 🔐 Security Notes

- ❌ **KHÔNG commit** API keys vào git
- ✅ Sử dụng `.env.local` cho sensitive data
- ✅ Add `.env.local` vào `.gitignore`
- ✅ Rotate keys định kỳ
- ✅ Sử dụng environment-specific keys (dev/prod)

## 🚧 Roadmap

- [ ] Tích hợp Imagen API cho image generation
- [ ] Video animation from images
- [ ] 3D model generation
- [ ] Voice input cho consultant
- [ ] Multi-language support
- [ ] Saved templates & presets
- [ ] Team collaboration features

## 📝 License

MIT License - See main project README

## 🤝 Contributing

Contributions welcome! Tạo Pull Request hoặc Issue trên GitHub.

## 📧 Support

- Email: support@baotienweb.cloud
- Docs: https://baotienweb.cloud/docs
- GitHub: [your-repo-url]

---

**Built with ❤️ using Google Gemini AI**
