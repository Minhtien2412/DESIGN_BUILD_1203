import React, { useState } from 'react';
import { CODE_TEMPLATES } from '../data/constants';
import { generatePHPCode } from '../services/geminiService';

type CodeType = 'hook' | 'controller' | 'model' | 'helper' | 'api';

export const ImplementationTab: React.FC = () => {
  const [requirement, setRequirement] = useState('');
  const [codeType, setCodeType] = useState<CodeType>('controller');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const codeTypes: { value: CodeType; label: string; icon: string }[] = [
    { value: 'hook', label: 'Hook', icon: '🪝' },
    { value: 'controller', label: 'Controller', icon: '🎮' },
    { value: 'model', label: 'Model', icon: '📊' },
    { value: 'helper', label: 'Helper', icon: '🔧' },
    { value: 'api', label: 'API Endpoint', icon: '🔗' },
  ];

  const handleGenerate = async () => {
    if (!requirement.trim()) return;
    
    setIsLoading(true);
    try {
      const code = await generatePHPCode(requirement, codeType);
      setGeneratedCode(code);
      setActiveTemplate(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateClick = (templateId: string) => {
    const template = CODE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setGeneratedCode(template.code);
      setActiveTemplate(templateId);
    }
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const filename = `${codeType}_${Date.now()}.php`;
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-morphism rounded-xl p-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span className="text-2xl">💻</span> PHP Code Generator
        </h2>
        <p className="text-slate-400 text-sm">
          Tạo code PHP cho Perfex CRM: hooks, controllers, models, helpers, và API endpoints.
        </p>
      </div>

      {/* Code Templates */}
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="font-semibold mb-3">📚 Code Templates Có Sẵn</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CODE_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template.id)}
              className={`text-left p-4 rounded-lg border transition-all ${
                activeTemplate === template.id
                  ? 'border-perfex-blue bg-perfex-blue/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className="font-medium text-perfex-blue">{template.name}</div>
              <div className="text-xs text-slate-400 mt-1">{template.description}</div>
              <div className="mt-2">
                <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                  {template.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Generator */}
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="font-semibold mb-3">✨ Tạo Code Mới</h3>
        
        {/* Code Type Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {codeTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setCodeType(type.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                codeType === type.value
                  ? 'bg-perfex-blue text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>

        {/* Requirement Input */}
        <textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="Mô tả chức năng cần tạo code...&#10;Ví dụ: Tạo controller quản lý AI prompts với CRUD operations, validation, và AJAX responses"
          className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-sm focus:border-perfex-blue focus:outline-none resize-none"
        />

        <button
          onClick={handleGenerate}
          disabled={isLoading || !requirement.trim()}
          className="mt-4 w-full bg-gradient-to-r from-perfex-blue to-gemini-purple text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Đang tạo code...
            </span>
          ) : (
            '🚀 Generate PHP Code'
          )}
        </button>
      </div>

      {/* Generated Code */}
      {generatedCode && (
        <div className="glass-morphism rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">📄 Code Generated</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 px-4 rounded-lg transition-colors"
              >
                📋 Copy
              </button>
              <button
                onClick={handleDownload}
                className="bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 px-4 rounded-lg transition-colors"
              >
                📥 Download .php
              </button>
            </div>
          </div>
          <div className="code-block overflow-auto max-h-[500px]">
            <pre className="text-sm text-slate-300">
              <code>{generatedCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* File Structure Guide */}
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="font-semibold mb-3">📁 Cấu Trúc Thư Mục Perfex CRM</h3>
        <div className="bg-slate-800/50 rounded-lg p-4 font-mono text-sm">
          <div className="text-slate-400">perfex_crm/</div>
          <div className="ml-4">
            <div className="text-slate-400">├── application/</div>
            <div className="ml-4">
              <div className="text-yellow-400">│   ├── hooks/          <span className="text-slate-500"># Custom hooks</span></div>
              <div className="text-blue-400">│   ├── controllers/    <span className="text-slate-500"># Controllers</span></div>
              <div className="text-green-400">│   ├── models/         <span className="text-slate-500"># Models</span></div>
              <div className="text-purple-400">│   ├── helpers/        <span className="text-slate-500"># Helper functions</span></div>
              <div className="text-orange-400">│   └── libraries/      <span className="text-slate-500"># Libraries</span></div>
            </div>
            <div className="text-slate-400">└── modules/</div>
            <div className="ml-4">
              <div className="text-cyan-400">    └── your_module/    <span className="text-slate-500"># Custom module</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
