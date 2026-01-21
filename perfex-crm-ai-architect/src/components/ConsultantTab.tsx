import React, { useEffect, useRef, useState } from 'react';
import { CONSULTING_TOPICS } from '../data/constants';
import { initChatSession, sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

export const ConsultantTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    initChatSession();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(messageText);
      
      const aiMessage: ChatMessage = {
        role: 'model',
        text: response.text,
        timestamp: new Date(),
        groundingLinks: response.groundingLinks,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTopicQuestion = (question: string) => {
    handleSend(question);
  };

  const formatMessage = (text: string) => {
    // Convert code blocks
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-slate-900 rounded-lg p-4 my-2 overflow-x-auto text-sm"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
    });
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Topics Sidebar */}
      <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto">
        <div className="glass-morphism rounded-xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">📚</span> Chuyên Mục Tư Vấn
          </h3>
          <div className="space-y-2">
            {CONSULTING_TOPICS.map((topic) => (
              <div key={topic.id}>
                <button
                  onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedTopic === topic.id
                      ? 'bg-perfex-blue/20 border border-perfex-blue/50'
                      : 'bg-slate-800/50 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{topic.icon}</span>
                    <span className="font-medium text-sm">{topic.title}</span>
                  </div>
                </button>
                
                {selectedTopic === topic.id && (
                  <div className="mt-2 ml-4 space-y-1">
                    {topic.questions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTopicQuestion(q)}
                        className="w-full text-left text-xs text-slate-400 hover:text-perfex-blue p-2 rounded hover:bg-slate-800/50 transition-colors"
                      >
                        💬 {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="glass-morphism rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-sm">⚡ Câu Hỏi Nhanh</h3>
          <div className="space-y-2">
            {[
              'Tạo module quản lý dự án kiến trúc',
              'Tích hợp AI tạo proposal tự động',
              'Thiết kế API cho mobile app',
              'Tối ưu performance Perfex CRM',
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="w-full text-left text-xs bg-slate-800/50 hover:bg-slate-700/50 p-2 rounded transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col glass-morphism rounded-xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="text-xl">🤖</span> AI Consultant - Gemini 2.0
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Chuyên gia tư vấn Perfex CRM, thiết kế kiến trúc, và tích hợp AI
          </p>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 py-10">
              <div className="text-5xl mb-4">💬</div>
              <p>Bắt đầu cuộc trò chuyện với AI Consultant</p>
              <p className="text-sm mt-2">Chọn chuyên mục bên trái hoặc nhập câu hỏi</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-perfex-blue text-white'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                {msg.role === 'model' ? (
                  <div
                    className="prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                  />
                ) : (
                  <p className="text-sm">{msg.text}</p>
                )}
                <div className="text-xs opacity-50 mt-2">
                  {msg.timestamp.toLocaleTimeString('vi-VN')}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:border-perfex-blue focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="bg-perfex-blue hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
