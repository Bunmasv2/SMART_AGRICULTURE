import { useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { Upload, X } from 'lucide-react';
import scanAnimation from '../../assets/animations/scan-effect.json';

interface ImageUploadScannerProps {
  onAnalyze: (file: File) => void;
  isScanning: boolean;
}

export const ImageUploadScanner = ({ onAnalyze, isScanning }: ImageUploadScannerProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Resize image to 224x224 for MobileNetV2
   * Uses center crop to maintain aspect ratio without distortion
   */
  const resizeImageTo224x224 = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      // Step 1: Read file as data URL
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          // Step 2: Create canvas with target size 224x224
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Cannot get canvas context'));
            return;
          }

          const targetSize = 224;
          canvas.width = targetSize;
          canvas.height = targetSize;

          // Step 3: Calculate center crop dimensions
          // Determine which dimension to use as reference (the smaller ratio)
          const scale = Math.max(
            targetSize / img.width,
            targetSize / img.height
          );

          // Scaled dimensions
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;

          // Center crop offsets
          const offsetX = (targetSize - scaledWidth) / 2;
          const offsetY = (targetSize - scaledHeight) / 2;

          // Step 4: Draw image on canvas with center crop
          // Fill with white background first (in case of transparency)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetSize, targetSize);

          // Draw the image centered and scaled
          ctx.drawImage(
            img,
            0, 0, img.width, img.height,           // Source rectangle
            offsetX, offsetY, scaledWidth, scaledHeight  // Destination rectangle
          );

          // Step 5: Convert canvas to Blob then to File
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas to Blob conversion failed'));
                return;
              }

              // Create new File object with original filename
              const resizedFile = new File(
                [blob],
                file.name,
                { type: 'image/jpeg', lastModified: Date.now() }
              );

              resolve(resizedFile);
            },
            'image/jpeg',
            0.95  // High quality JPEG (95%)
          );
        };

        img.onerror = () => reject(new Error('Image load failed'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        // Resize image to 224x224
        const resized = await resizeImageTo224x224(file);
        setProcessedFile(resized);

        // Create preview URL from resized file
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(resized);
      } catch (error) {
        console.error('Image resize failed:', error);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        // Resize image to 224x224
        const resized = await resizeImageTo224x224(file);
        setProcessedFile(resized);

        // Create preview URL from resized file
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(resized);
      } catch (error) {
        console.error('Image resize failed:', error);
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setProcessedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = () => {
    if (processedFile && !isScanning) {
      onAnalyze(processedFile);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Tải ảnh lên để phân tích
      </h3>

      {/* Upload Area - Square aspect ratio for 224x224 display */}
      <div className="mb-4 w-full max-w-sm mx-auto">
        <div
          onClick={!previewUrl ? handleClick : undefined}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative aspect-square rounded-lg overflow-hidden ${
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

              {/* Remove Button */}
              {!isScanning && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Scanning Animation Overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                  <Lottie
                    animationData={scanAnimation}
                    loop={true}
                    className="w-full h-full"
                  />
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <p className="text-white font-medium text-lg drop-shadow-lg">
                      Đang phân tích hình ảnh...
                    </p>
                  </div>
                </div>
              )}
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

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!processedFile || isScanning}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          !processedFile || isScanning
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-md hover:shadow-lg'
        }`}
      >
        {isScanning ? 'Đang phân tích...' : 'Bắt đầu Phân tích'}
      </button>
    </div>
  );
};
