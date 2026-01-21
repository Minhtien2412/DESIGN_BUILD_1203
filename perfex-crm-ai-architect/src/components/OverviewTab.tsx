import React, { useEffect, useState } from 'react';
import { QUICK_ACTIONS } from '../data/constants';
import { checkGeminiStatus } from '../services/geminiService';
import { SystemStatus } from '../types';

interface OverviewTabProps {
  onNavigate: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigate }) => {
  const [systems, setSystems] = useState<SystemStatus[]>([
    { name: 'Gemini AI', status: 'loading', lastCheck: new Date() },
    { name: 'Perfex CRM API', status: 'loading', lastCheck: new Date() },
    { name: 'Image Generation', status: 'loading', lastCheck: new Date() },
    { name: 'Live Voice', status: 'loading', lastCheck: new Date() },
  ]);

  useEffect(() => {
    checkAllSystems();
    const interval = setInterval(checkAllSystems, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkAllSystems = async () => {
    // Check Gemini
    const geminiResult = await checkGeminiStatus();
    
    setSystems(prev => prev.map(sys => {
      if (sys.name === 'Gemini AI') {
        return { ...sys, status: geminiResult.status, latency: geminiResult.latency, lastCheck: new Date() };
      }
      // Simulate other systems
      return { ...sys, status: 'online', latency: Math.floor(Math.random() * 200) + 50, lastCheck: new Date() };
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-yellow-500 animate-pulse';
    }
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'create-module':
      case 'add-ai-chat':
      case 'analyze-code':
      case 'api-docs':
        onNavigate('implementation');
        break;
      case 'design-villa':
        onNavigate('visualizer');
        break;
      case 'generate-proposal':
        onNavigate('consultant');
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-morphism rounded-xl p-6 bg-gradient-to-r from-perfex-blue/20 to-gemini-purple/20">
        <h2 className="text-2xl font-bold mb-2">🏗️ Chào mừng đến với Perfex CRM AI Architect</h2>
        <p className="text-slate-400">
          Công cụ chuyên nghiệp tích hợp Gemini AI vào Perfex CRM - Thiết kế kiến trúc, tạo code, và tư vấn AI.
        </p>
      </div>

      {/* System Status */}
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">📡</span> Trạng Thái Hệ Thống AI
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systems.map((sys) => (
            <div key={sys.name} className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(sys.status)}`}></div>
                <span className="font-medium text-sm">{sys.name}</span>
              </div>
              <div className="text-xs text-slate-400">
                {sys.status === 'online' && sys.latency && (
                  <span className="text-green-400">{sys.latency}ms</span>
                )}
                {sys.status === 'offline' && (
                  <span className="text-red-400">Không kết nối</span>
                )}
                {sys.status === 'loading' && (
                  <span className="text-yellow-400">Đang kiểm tra...</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={checkAllSystems}
          className="mt-4 text-sm text-perfex-blue hover:underline"
        >
          🔄 Kiểm tra lại
        </button>
      </div>

      {/* Quick Actions */}
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Thao Tác Nhanh
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              className="bg-slate-800/50 hover:bg-slate-700/50 rounded-lg p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <div className="font-medium">{action.title}</div>
              <div className="text-xs text-slate-400 mt-1">{action.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-morphism rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-perfex-blue">4</div>
          <div className="text-sm text-slate-400">Khách hàng</div>
        </div>
        <div className="glass-morphism rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gemini-purple">2</div>
          <div className="text-sm text-slate-400">Dự án</div>
        </div>
        <div className="glass-morphism rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-500">1</div>
          <div className="text-sm text-slate-400">Hóa đơn</div>
        </div>
        <div className="glass-morphism rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-500">∞</div>
          <div className="text-sm text-slate-400">AI Queries</div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-morphism rounded-xl p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">🏛️</span> Kiến Trúc Hệ Thống
          </h4>
          <p className="text-sm text-slate-400 mb-3">
            Tạo sơ đồ kiến trúc SVG từ mô tả văn bản. Hiển thị flow dữ liệu giữa Perfex CRM, Gemini AI, và các services.
          </p>
          <button 
            onClick={() => onNavigate('architecture')}
            className="text-perfex-blue text-sm hover:underline"
          >
            Bắt đầu thiết kế →
          </button>
        </div>
        
        <div className="glass-morphism rounded-xl p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">💻</span> PHP Code Generator
          </h4>
          <p className="text-sm text-slate-400 mb-3">
            Tự động tạo hooks, controllers, models, helpers cho Perfex CRM với best practices và comments.
          </p>
          <button 
            onClick={() => onNavigate('implementation')}
            className="text-perfex-blue text-sm hover:underline"
          >
            Tạo code ngay →
          </button>
        </div>
        
        <div className="glass-morphism rounded-xl p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">🎨</span> Design Visualizer
          </h4>
          <p className="text-sm text-slate-400 mb-3">
            Tạo hình ảnh kiến trúc với nhiều phong cách: Modern Luxury, Tropical Villa, Minimalist, và hơn thế nữa.
          </p>
          <button 
            onClick={() => onNavigate('visualizer')}
            className="text-perfex-blue text-sm hover:underline"
          >
            Khám phá styles →
          </button>
        </div>
        
        <div className="glass-morphism rounded-xl p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">🤖</span> AI Consultant
          </h4>
          <p className="text-sm text-slate-400 mb-3">
            Tư vấn trực tiếp với AI về phát triển Perfex, thiết kế kiến trúc, và tối ưu hệ thống.
          </p>
          <button 
            onClick={() => onNavigate('consultant')}
            className="text-perfex-blue text-sm hover:underline"
          >
            Bắt đầu chat →
          </button>
        </div>
      </div>
    </div>
  );
};
