import React, { useState } from 'react';
import { generateArchitectureDiagram } from '../services/geminiService';

export const ArchitectureTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [svgDiagram, setSvgDiagram] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetArchitectures = [
    {
      name: 'CRM + AI Chatbot',
      query: 'Tích hợp Gemini AI chatbot vào Perfex CRM customer portal với WebSocket real-time',
    },
    {
      name: 'Document Processing',
      query: 'Hệ thống xử lý document với Gemini Vision, OCR và lưu trữ vào Perfex CRM',
    },
    {
      name: 'Multi-tenant SaaS',
      query: 'Kiến trúc multi-tenant cho Perfex CRM với load balancer và database sharding',
    },
    {
      name: 'Mobile + API Gateway',
      query: 'Mobile app React Native kết nối Perfex CRM qua API Gateway với authentication',
    },
  ];

  const handleGenerate = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const svg = await generateArchitectureDiagram(query);
      setSvgDiagram(svg);
    } catch (err) {
      setError('Không thể tạo sơ đồ. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreset = (presetQuery: string) => {
    setQuery(presetQuery);
  };

  const handleDownload = () => {
    if (!svgDiagram) return;
    
    const blob = new Blob([svgDiagram], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture-diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-morphism rounded-xl p-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span className="text-2xl">🏛️</span> Kiến Trúc Hệ Thống
        </h2>
        <p className="text-slate-400 text-sm">
          Mô tả ý tưởng của bạn và AI sẽ tạo sơ đồ kiến trúc hệ thống SVG chuyên nghiệp.
        </p>
      </div>

      {/* Preset Templates */}
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="font-semibold mb-3">📋 Mẫu Có Sẵn</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presetArchitectures.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePreset(preset.query)}
              className="bg-slate-800/50 hover:bg-slate-700/50 rounded-lg p-3 text-left text-sm transition-all"
            >
              <div className="font-medium text-perfex-blue">{preset.name}</div>
              <div className="text-xs text-slate-400 mt-1 line-clamp-2">{preset.query}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="font-semibold mb-3">✏️ Mô Tả Kiến Trúc</h3>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ví dụ: Tích hợp Gemini AI vào Perfex CRM để tự động tạo proposal, với caching Redis và queue system..."
          className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-sm focus:border-perfex-blue focus:outline-none resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !query.trim()}
            className="flex-1 bg-gradient-to-r from-perfex-blue to-gemini-purple text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Đang tạo...
              </span>
            ) : (
              '🚀 Tạo Sơ Đồ Kiến Trúc'
            )}
          </button>
          {svgDiagram && (
            <button
              onClick={handleDownload}
              className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              📥 Tải SVG
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Result */}
      {svgDiagram && (
        <div className="glass-morphism rounded-xl p-6">
          <h3 className="font-semibold mb-4">📊 Kết Quả</h3>
          <div 
            className="bg-slate-900 rounded-lg p-4 overflow-auto"
            dangerouslySetInnerHTML={{ __html: svgDiagram }}
          />
        </div>
      )}

      {/* Legend */}
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="font-semibold mb-3">📖 Chú Thích</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-perfex-blue"></div>
            <span>Perfex CRM Components</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gemini-purple"></div>
            <span>Gemini AI Services</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Database / Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-600"></div>
            <span>External Services</span>
          </div>
        </div>
      </div>
    </div>
  );
};
