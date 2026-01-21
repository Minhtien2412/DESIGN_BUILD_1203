import { useState } from 'react';
import { ArchitectureTab } from './components/ArchitectureTab';
import { ConsultantTab } from './components/ConsultantTab';
import { ImplementationTab } from './components/ImplementationTab';
import { OverviewTab } from './components/OverviewTab';
import { VisualizerTab } from './components/VisualizerTab';
import { AppTab } from './types';

const TABS: { id: AppTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Tổng Quan', icon: '📊' },
  { id: 'architecture', label: 'Kiến Trúc', icon: '🏗️' },
  { id: 'implementation', label: 'Triển Khai', icon: '💻' },
  { id: 'visualizer', label: 'Visualizer', icon: '🎨' },
  { id: 'consultant', label: 'Tư Vấn AI', icon: '🤖' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'architecture':
        return <ArchitectureTab />;
      case 'implementation':
        return <ImplementationTab />;
      case 'visualizer':
        return <VisualizerTab />;
      case 'consultant':
        return <ConsultantTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="glass-morphism border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🏛️</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-perfex-blue to-gemini-purple bg-clip-text text-transparent">
                  Perfex CRM AI Architect
                </h1>
                <p className="text-xs text-slate-400">Powered by Gemini 2.0 Flash</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-400">API Connected</span>
              </div>
              <a
                href="https://thietkeresort.com.vn/perfex_crm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                🔗 Perfex CRM
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="container mx-auto px-6 pt-6">
        <div className="glass-morphism rounded-xl p-2 inline-flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-perfex-blue to-gemini-purple text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>© 2025 Perfex CRM AI Architect</span>
              <span>•</span>
              <span>Thiet Ke Resort</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span>⚡</span> Gemini 2.0 Flash
              </span>
              <span>|</span>
              <span className="flex items-center gap-1">
                <span>🏢</span> Perfex CRM v3.x
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
