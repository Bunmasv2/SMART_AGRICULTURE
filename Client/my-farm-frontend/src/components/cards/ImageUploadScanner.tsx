import { useRef, useState } from 'react';
import { Upload, RefreshCw } from 'lucide-react';

interface ImageUploadScannerProps {
  onAnalyze: (file: File) => void;
  isScanning: boolean;
}

/**
 * Scanning Animation Component - TailwindCSS + Custom Keyframes
 */
const ScanningAnimation = () => {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
        {/* Scanning Line Effect - Moving from top to bottom */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]"
            style={{ animation: 'scanLine 2.5s ease-in-out infinite' }}
          />
        </div>

        {/* Outer Pulse Ring */}
        <div
          className="absolute w-40 h-40 rounded-full border-2 border-cyan-300/40"
          style={{ animation: 'pulseRing 2s ease-in-out infinite' }}
        />

        {/* Middle Pulse Circle */}
        <div
          className="absolute w-32 h-32 rounded-full border-4 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.6)]"
          style={{ animation: 'pulseCircle 2s ease-in-out infinite' }}
        />

        {/* Center Icon - Animated Search/Scan */}
        <div className="absolute animate-pulse">
          <svg
            className="w-16 h-16 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
        </div>

        {/* Animated Dots */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-16 flex gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>

        {/* Text with gradient */}
        <div className="absolute bottom-6 left-0 right-0 text-center px-4">
          <p className="text-white font-bold text-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] animate-pulse">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              🔬 Đang phân tích hình ảnh
            </span>
          </p>
          <div className="flex justify-center gap-1 mt-2">
            <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
            <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
            <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>
      </div>

      {/* CSS Keyframes for custom animations */}
      <style>{`
        @keyframes scanLine {
          0% {
            top: -10%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 110%;
            opacity: 0;
          }
        }

        @keyframes pulseCircle {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.6;
          }
        }

        @keyframes pulseRing {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.25);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export const ImageUploadScanner = ({ onAnalyze, isScanning }: ImageUploadScannerProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setImageState = (file: File) => {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageState(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageState(file);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = () => {
    if (selectedFile && !isScanning) {
      console.log('🔍 ImageUploadScanner: Starting analysis...');
      console.log('📁 File:', selectedFile.name, selectedFile.size, 'bytes');
      console.log('📏 Type:', selectedFile.type);
      onAnalyze(selectedFile);
    } else {
      console.warn('⚠️ Cannot analyze:', {
        hasFile: !!selectedFile,
        isScanning
      });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Tải ảnh lên để phân tích
      </h3>

      {/* Upload Area */}
      <div className="mb-4 flex-1 min-h-0 w-full max-w-sm mx-auto">
        <div
          onClick={!previewUrl ? handleClick : undefined}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative h-full min-h-[180px] max-h-[320px] rounded-lg overflow-hidden ${
            !previewUrl
              ? 'border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200'
              : 'border border-gray-200'
          }`}
        >
          {/* Empty State */}
          {!previewUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-600 font-medium mb-1">
                Kéo thả hoặc click để chọn ảnh lá cây
              </p>
              <p className="text-sm text-gray-400">
                Hỗ trợ JPG, PNG (tối đa 10MB)
              </p>
            </div>
          )}

          {/* Image Preview */}
          {previewUrl && (
            <>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />

              {/* Scanning Animation Overlay */}
              {isScanning && <ScanningAnimation />}
            </>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Action Buttons */}
      {!previewUrl ? (
        // No image - show upload button
        <button
          onClick={handleClick}
          className="w-full py-2.5 px-4 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Chọn ảnh để phân tích
        </button>
      ) : (
        // Has image - show analyze and change buttons
        <div className="space-y-3">
          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || isScanning}
            className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
              !selectedFile || isScanning
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isScanning ? (
              <>
                <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Đang phân tích...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bắt đầu Phân tích
              </>
            )}
          </button>

          {!isScanning && (
            <button
              onClick={handleRemoveImage}
              className="w-full py-2.5 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Phân tích ảnh khác
            </button>
          )}
        </div>
      )}
    </div>
  );
};
