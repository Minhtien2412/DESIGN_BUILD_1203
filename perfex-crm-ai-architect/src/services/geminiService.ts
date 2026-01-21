import { Chat, GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

// ==================== CHAT CONSULTANT ====================

let chatSession: Chat | null = null;

const SYSTEM_INSTRUCTION = `Bạn là AI Kiến Trúc Sư chuyên gia cho Perfex CRM, hỗ trợ:
1. Thiết kế kiến trúc hệ thống tích hợp AI (Gemini) vào Perfex CRM
2. Viết code PHP cho modules, hooks, controllers, helpers
3. Tư vấn thiết kế UI/UX cho CRM
4. Phân tích và tối ưu hiệu suất hệ thống
5. Thiết kế kiến trúc resort, biệt thự, nhà ở

Trả lời bằng tiếng Việt, chuyên nghiệp, có code examples khi cần.
Format code với \`\`\`php hoặc \`\`\`javascript.`;

export async function initChatSession(): Promise<Chat> {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
  }
  return chatSession;
}

export async function sendChatMessage(message: string): Promise<{
  text: string;
  groundingLinks?: { title: string; uri: string }[];
}> {
  const chat = await initChatSession();
  const response = await chat.sendMessage({ message });
  
  return {
    text: response.text || '',
    groundingLinks: [],
  };
}

// ==================== ARCHITECTURE DIAGRAM ====================

export async function generateArchitectureDiagram(query: string): Promise<string> {
  const prompt = `Tạo một sơ đồ kiến trúc hệ thống SVG cho yêu cầu sau:

"${query}"

Yêu cầu:
1. Tạo SVG với kích thước viewBox="0 0 800 600"
2. Sử dụng màu sắc chuyên nghiệp: #03a9f4 (Perfex Blue), #8e44ad (Gemini Purple), #2ecc71 (Success), #e74c3c (Error)
3. Bao gồm các thành phần: Client, API Gateway, Perfex CRM, Gemini AI, Database
4. Vẽ các mũi tên kết nối giữa các thành phần
5. Thêm labels tiếng Việt rõ ràng
6. Style hiện đại với rounded corners và shadows

CHỈ TRẢ VỀ CODE SVG, KHÔNG CÓ GIẢI THÍCH.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  let svgCode = response.text || '';
  
  // Extract SVG from response
  const svgMatch = svgCode.match(/<svg[\s\S]*<\/svg>/i);
  if (svgMatch) {
    svgCode = svgMatch[0];
  } else {
    // Generate fallback SVG
    svgCode = generateFallbackArchitectureSVG(query);
  }
  
  return svgCode;
}

function generateFallbackArchitectureSVG(query: string): string {
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
      </filter>
      <linearGradient id="perfexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#03a9f4"/>
        <stop offset="100%" style="stop-color:#0288d1"/>
      </linearGradient>
      <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#8e44ad"/>
        <stop offset="100%" style="stop-color:#6c3483"/>
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="800" height="600" fill="#0f172a"/>
    
    <!-- Title -->
    <text x="400" y="40" text-anchor="middle" fill="#f1f5f9" font-size="20" font-weight="bold">
      Kiến Trúc Hệ Thống: ${query.substring(0, 50)}
    </text>
    
    <!-- Client Layer -->
    <rect x="300" y="70" width="200" height="60" rx="10" fill="#1e293b" filter="url(#shadow)"/>
    <text x="400" y="105" text-anchor="middle" fill="#f1f5f9" font-size="14">📱 Client App</text>
    
    <!-- Arrow -->
    <path d="M400 130 L400 170" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"/>
    
    <!-- API Gateway -->
    <rect x="250" y="180" width="300" height="60" rx="10" fill="url(#perfexGrad)" filter="url(#shadow)"/>
    <text x="400" y="215" text-anchor="middle" fill="white" font-size="14" font-weight="bold">🔗 API Gateway</text>
    
    <!-- Arrows to services -->
    <path d="M320 240 L200 300" stroke="#64748b" stroke-width="2"/>
    <path d="M400 240 L400 300" stroke="#64748b" stroke-width="2"/>
    <path d="M480 240 L600 300" stroke="#64748b" stroke-width="2"/>
    
    <!-- Perfex CRM -->
    <rect x="100" y="310" width="180" height="80" rx="10" fill="url(#perfexGrad)" filter="url(#shadow)"/>
    <text x="190" y="345" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🏢 Perfex CRM</text>
    <text x="190" y="365" text-anchor="middle" fill="#e0f2fe" font-size="10">Modules, Hooks</text>
    
    <!-- Gemini AI -->
    <rect x="310" y="310" width="180" height="80" rx="10" fill="url(#geminiGrad)" filter="url(#shadow)"/>
    <text x="400" y="345" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🤖 Gemini AI</text>
    <text x="400" y="365" text-anchor="middle" fill="#f3e8ff" font-size="10">Vision, Text, Code</text>
    
    <!-- External APIs -->
    <rect x="520" y="310" width="180" height="80" rx="10" fill="#1e293b" filter="url(#shadow)"/>
    <text x="610" y="345" text-anchor="middle" fill="#f1f5f9" font-size="12" font-weight="bold">🌐 External APIs</text>
    <text x="610" y="365" text-anchor="middle" fill="#94a3b8" font-size="10">Payment, SMS, Email</text>
    
    <!-- Database Layer -->
    <rect x="200" y="450" width="400" height="60" rx="10" fill="#1e293b" filter="url(#shadow)"/>
    <text x="400" y="485" text-anchor="middle" fill="#f1f5f9" font-size="14">🗄️ MySQL Database + Redis Cache</text>
    
    <!-- Arrows to database -->
    <path d="M190 390 L300 450" stroke="#64748b" stroke-width="2"/>
    <path d="M400 390 L400 450" stroke="#64748b" stroke-width="2"/>
    <path d="M610 390 L500 450" stroke="#64748b" stroke-width="2"/>
    
    <!-- Legend -->
    <rect x="600" y="530" width="15" height="15" fill="url(#perfexGrad)"/>
    <text x="620" y="542" fill="#94a3b8" font-size="10">Perfex CRM</text>
    <rect x="600" y="555" width="15" height="15" fill="url(#geminiGrad)"/>
    <text x="620" y="567" fill="#94a3b8" font-size="10">Gemini AI</text>
  </svg>`;
}

// ==================== PHP CODE GENERATOR ====================

export async function generatePHPCode(requirement: string, codeType: string): Promise<string> {
  const prompts: Record<string, string> = {
    hook: `Tạo Perfex CRM Hook PHP cho: "${requirement}"
    
Yêu cầu:
- Đặt trong folder application/hooks/
- Sử dụng hooks system của Perfex CRM
- Thêm comments tiếng Việt
- Xử lý lỗi đầy đủ`,

    controller: `Tạo Perfex CRM Controller PHP cho: "${requirement}"
    
Yêu cầu:
- Extend AdminController hoặc ClientsController
- Thêm các methods CRUD đầy đủ
- Validate input data
- Trả về JSON response cho AJAX`,

    model: `Tạo Perfex CRM Model PHP cho: "${requirement}"
    
Yêu cầu:
- Extend App_Model
- Các methods: get, add, update, delete
- Sử dụng CodeIgniter Query Builder
- Xử lý relationships nếu cần`,

    helper: `Tạo Perfex CRM Helper PHP cho: "${requirement}"
    
Yêu cầu:
- Các functions utility
- Có thể gọi từ bất kỳ đâu
- Optimized performance
- Xử lý edge cases`,

    api: `Tạo Perfex CRM API Endpoint PHP cho: "${requirement}"
    
Yêu cầu:
- REST API chuẩn (GET, POST, PUT, DELETE)
- Authentication với token
- Rate limiting
- Response format JSON`,
  };

  const prompt = prompts[codeType] || prompts.controller;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt + '\n\nTRẢ VỀ CODE PHP HOÀN CHỈNH VỚI COMMENTS.',
  });

  return response.text || '// Không thể tạo code';
}

// ==================== IMAGE GENERATION ====================

export async function generateArchitectureImage(
  prompt: string,
  style: string,
  aspectRatio: string = '16:9'
): Promise<string> {
  const fullPrompt = `${style} architectural visualization: ${prompt}. 
Photorealistic, professional photography, high quality, 8K resolution, 
architectural digest style, perfect lighting, modern design.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: fullPrompt,
    });
    
    // For now, return a placeholder since Gemini text model doesn't generate images
    // In production, you would use Imagen or another image generation API
    return `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80`;
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
}

// ==================== LIVE SESSION ====================

let liveSession: Session | null = null;

export async function startLiveSession(
  onModelTurn: (text: string) => void,
  onUserTranscript: (text: string) => void
): Promise<Session> {
  liveSession = await ai.live.connect({
    model: 'gemini-2.0-flash-live-001',
    callbacks: {
      onMessage: (message: LiveServerMessage) => {
        if (message.serverContent?.modelTurn?.parts) {
          const text = message.serverContent.modelTurn.parts
            .map(p => p.text || '')
            .join('');
          if (text) onModelTurn(text);
        }
      },
    },
    config: {
      responseModalities: [Modality.TEXT],
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
    },
  });

  return liveSession;
}

export function endLiveSession() {
  if (liveSession) {
    liveSession.close();
    liveSession = null;
  }
}

export async function sendAudioToLive(audioData: ArrayBuffer) {
  if (!liveSession) throw new Error('No active live session');
  
  await liveSession.sendRealtimeInput({
    audio: {
      data: arrayBufferToBase64(audioData),
      mimeType: 'audio/pcm;rate=16000',
    },
  });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ==================== SYSTEM STATUS ====================

export async function checkGeminiStatus(): Promise<{
  status: 'online' | 'offline';
  latency: number;
}> {
  const start = Date.now();
  try {
    await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'ping',
    });
    return {
      status: 'online',
      latency: Date.now() - start,
    };
  } catch {
    return {
      status: 'offline',
      latency: 0,
    };
  }
}
