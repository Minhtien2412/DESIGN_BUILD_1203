import React, { useRef, useState } from 'react';
import { ARCHITECTURE_STYLES } from '../data/constants';
import { ImageAspectRatio, ImageSize } from '../types';

const ASPECT_RATIOS: ImageAspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"];
const SIZES: ImageSize[] = ["1K", "2K", "4K"];

export const VisualizerTab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>("16:9");
  const [quality, setQuality] = useState<ImageSize>("2K");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    const style = ARCHITECTURE_STYLES.find(s => s.id === styleId);
    if (style) {
      setPrompt((prev) => prev ? `${prev}, phong cách ${style.nameVi}` : `Thiết kế ${style.nameVi}`);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    
    // Simulate image generation (in production, use actual AI image generation)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Use a placeholder image based on selected style
    const style = ARCHITECTURE_STYLES.find(s => s.id === selectedStyle);
    setGeneratedImage(style?.image || ARCHITECTURE_STYLES[0].image);
    
    setIsLoading(false);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-morphism rounded-xl p-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span className="text-2xl">🎨</span> Design Visualizer
        </h2>
        <p className="text-slate-400 text-sm">
          Tạo hình ảnh kiến trúc với AI - Chọn phong cách, mô tả ý tưởng, và xem kết quả.
        </p>
      </div>

      {/* Style Gallery */}
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span className="text-xl">🏛️</span> Thư Viện Phong Cách Kiến Trúc
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ARCHITECTURE_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleSelect(style.id)}
              className={`relative overflow-hidden rounded-xl transition-all ${
                selectedStyle === style.id
                  ? 'ring-2 ring-perfex-blue scale-[1.02]'
                  : 'hover:scale-[1.02]'
              }`}
            >
              <img
                src={style.image}
                alt={style.nameVi}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                <div className="font-medium text-white text-sm">{style.nameVi}</div>
                <div className="text-xs text-slate-300">{style.name}</div>
              </div>
              {selectedStyle === style.id && (
                <div className="absolute top-2 right-2 bg-perfex-blue rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          {/* Prompt Input */}
          <div className="glass-morphism rounded-xl p-6">
            <h3 className="font-semibold mb-3">✏️ Mô Tả Thiết Kế</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ví dụ: Biệt thự 3 tầng với hồ bơi vô cực, view biển, phòng khách double-height..."
              className="w-full h-28 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-sm focus:border-perfex-blue focus:outline-none resize-none"
            />
          </div>

          {/* Options */}
          <div className="glass-morphism rounded-xl p-6">
            <h3 className="font-semibold mb-3">⚙️ Tùy Chọn</h3>
            
            <div className="mb-4">
              <label className="text-sm text-slate-400 mb-2 block">Tỉ lệ khung hình</label>
              <div className="flex flex-wrap gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      aspectRatio === ratio
                        ? 'bg-perfex-blue text-white'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Chất lượng</label>
              <div className="flex gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setQuality(size)}
                    className={`px-4 py-1.5 rounded-lg text-sm ${
                      quality === size
                        ? 'bg-gemini-purple text-white'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`glass-morphism rounded-xl p-6 border-2 border-dashed cursor-pointer transition-all ${
              isDragging
                ? 'border-perfex-blue bg-perfex-blue/10'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <div className="text-center">
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm">Kéo thả hoặc click để upload ảnh tham khảo</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP (max 10MB)</p>
            </div>
          </div>

          {uploadedImage && (
            <div className="glass-morphism rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Ảnh tham khảo:</span>
                <button
                  onClick={() => setUploadedImage(null)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Xóa
                </button>
              </div>
              <img src={uploadedImage} alt="Uploaded" className="w-full h-32 object-cover rounded-lg" />
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-perfex-blue to-gemini-purple text-white font-medium py-4 px-6 rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Đang tạo hình ảnh...
              </span>
            ) : (
              '🎨 Tạo Hình Ảnh Kiến Trúc'
            )}
          </button>
        </div>

        {/* Result Panel */}
        <div className="glass-morphism rounded-xl p-6">
          <h3 className="font-semibold mb-4">🖼️ Kết Quả</h3>
          
          {generatedImage ? (
            <div className="space-y-4">
              <img
                src={generatedImage}
                alt="Generated architecture"
                className="w-full rounded-xl shadow-lg"
              />
              <div className="flex gap-2">
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 px-4 rounded-lg text-sm transition-colors">
                  📥 Tải xuống
                </button>
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 px-4 rounded-lg text-sm transition-colors">
                  🔄 Tạo lại
                </button>
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 px-4 rounded-lg text-sm transition-colors">
                  ✏️ Chỉnh sửa
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center bg-slate-800/50 rounded-xl">
              <div className="text-center text-slate-500">
                <div className="text-5xl mb-4">🏠</div>
                <p>Kết quả sẽ hiển thị ở đây</p>
                <p className="text-sm mt-2">Chọn phong cách và mô tả ý tưởng để bắt đầu</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Style Details */}
      {selectedStyle && (
        <div className="glass-morphism rounded-xl p-6">
          <h3 className="font-semibold mb-3">📋 Chi Tiết Phong Cách</h3>
          {(() => {
            const style = ARCHITECTURE_STYLES.find(s => s.id === selectedStyle);
            if (!style) return null;
            return (
              <div className="flex gap-6">
                <img src={style.image} alt={style.nameVi} className="w-48 h-32 object-cover rounded-lg" />
                <div>
                  <h4 className="font-medium text-perfex-blue">{style.nameVi}</h4>
                  <p className="text-sm text-slate-400 mt-1">{style.description}</p>
                  <div className="flex gap-2 mt-3">
                    {style.tags.map(tag => (
                      <span key={tag} className="text-xs bg-slate-800 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
