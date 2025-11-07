import { ApiError, apiFetch } from './api';

export type BotReply = { reply: string };

// Example endpoint path; replace with your backend path
const BOT_PATH = '/chatbot/reply';

export async function askBot(message: string): Promise<string> {
  try {
    const data = await apiFetch<BotReply>(BOT_PATH, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    return data.reply;
  } catch (err) {
    // Fallback deterministic reply for offline/dev
    // eslint-disable-next-line no-console
    console.warn('askBot error', err);
    if (err instanceof ApiError) {
      if ((err.status || 0) >= 500) {
        return 'Máy chủ đang bận (500). Vui lòng thử lại sau ít phút.';
      }
      return 'Hiện không thể kết nối máy chủ. Vui lòng thử lại sau.';
    }
    return 'Cảm ơn bạn! Chúng tôi đã nhận được câu hỏi và sẽ phản hồi sớm.';
  }
}
