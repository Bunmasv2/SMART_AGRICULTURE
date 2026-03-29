import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus,
  Droplets,
  ScanLine,
  ChevronLeft,
} from 'lucide-react';
import { useRef } from 'react';
import aiAnalysisService from '../../services/aiAnalysisService';
import { HistoryListCard } from '../../components/cards/HistoryListCard';
import { DiseaseDetailDrawer } from '../../components/slide-overs/DiseaseDetailDrawer';
import { saveUploadedDiseaseImage, saveUploadedHistoryImage } from '../../data/DiseaseDictionary';
import type {
  AiAnalysisResponse,
  AnalysisHistoryItem,
  WeatherInfo,
  PlantingBatchOption,
} from '../../models/AiAnalysis';

interface InfoItem {
  label: string;
  value: string | number;
  unit?: string;
}

const mockWeatherInfo: WeatherInfo = {
  condition: 'Nắng nhẹ',
  temperature: 28,
  humidity: 72,
  location: 'Vĩnh Long, Việt Nam',
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const getDiseaseColor = (cls: string) => {
  const n = cls.toLowerCase();
  if (n.includes('healthy')) {
    return { accent: '#10b981', label: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  if (n.includes('deficiency') || n.includes('dry')) {
    return { accent: '#f59e0b', label: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  return { accent: '#ef4444', label: 'bg-red-50 text-red-700 border-red-200' };
};

const ScanningOverlay = () => (
  <>
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-900/60 backdrop-blur-[2px]">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 animate-ping rounded-full border border-cyan-400/30" />
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-400"
          style={{ animation: 'pulseCircle 2s ease-in-out infinite' }}
        >
          <ScanLine className="h-7 w-7 text-cyan-300" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Đang phân tích</p>
        <div className="mt-2 flex justify-center gap-1.5">
          {[0, 0.2, 0.4].map((d, i) => (
            <span key={i} className="h-1 w-1 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
          style={{ animation: 'scanLine 2.5s ease-in-out infinite' }}
        />
      </div>
    </div>

    <style>{`
      @keyframes scanLine { 0%{top:-5%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:105%;opacity:0} }
      @keyframes pulseCircle { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
    `}</style>
  </>
);

const ImageUploadSection = ({
  onAnalyze,
  isScanning,
  onValidationError,
}: {
  onAnalyze: (f: File) => void;
  isScanning: boolean;
  onValidationError: (message: string) => void;
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const setImg = (file: File) => {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const validateAndSetImage = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      onValidationError('Ảnh không hợp lệ. Vui lòng chọn JPG, PNG hoặc WEBP.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      onValidationError('Kích thước ảnh vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    onValidationError('');
    setImg(file);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <Upload className="h-3.5 w-3.5 text-emerald-600" />
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Tải ảnh phân tích</span>
      </div>

      <div
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        className={`relative min-h-[180px] flex-1 overflow-hidden rounded-2xl border transition-all duration-200 md:min-h-[210px] lg:min-h-[230px] ${
          !previewUrl
            ? 'cursor-pointer border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-emerald-50/30 hover:border-emerald-400'
            : 'border-slate-200 bg-slate-100'
        }`}
      >
        {!previewUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
              <Upload className="h-6 w-6 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">Kéo thả hoặc click để chọn ảnh</p>
              <p className="mt-1 text-xs text-slate-400">Hỗ trợ JPG, PNG (Tối đa 10MB)</p>
            </div>
          </div>
        ) : (
          <>
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            {isScanning && <ScanningOverlay />}
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          validateAndSetImage(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div className="mt-4 flex shrink-0 gap-2">
        {!previewUrl ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Chọn ảnh mới
          </button>
        ) : (
          <>
            <button
              onClick={() => selectedFile && !isScanning && onAnalyze(selectedFile)}
              disabled={!selectedFile || isScanning}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                isScanning ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isScanning ? (
                'Đang xử lý...'
              ) : (
                <>
                  <ScanLine className="h-4 w-4" /> Bắt đầu phân tích
                </>
              )}
            </button>
            {!isScanning && (
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const InfoStrip = ({ data, className = '' }: { data: InfoItem[]; className?: string }) => (
  <div className={`custom-scrollbar flex h-full w-full items-center gap-2 overflow-x-auto py-1 ${className}`}>
    {data.map((item, i) => (
      <div
        key={i}
        className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{item.label}:</span>
        <span className="text-[11px] font-semibold text-slate-700">
          {item.value}
          {item.unit && <span className="ml-0.5 text-[9px] font-normal lowercase text-slate-400">{item.unit}</span>}
        </span>
      </div>
    ))}
  </div>
);

const ResultSection = ({
  result,
  isLoading,
  onOpenDetail,
}: {
  result: AiAnalysisResponse | null;
  isLoading: boolean;
  onOpenDetail: (diseaseClass: string) => void;
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 rounded-xl bg-slate-50" />
        <div className="h-32 rounded-xl bg-slate-50" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-100 py-12 text-slate-300">
        <Eye className="mb-2 h-12 w-12 opacity-20" />
        <p className="text-sm font-medium">Kết quả phân tích sẽ hiển thị tại đây</p>
      </div>
    );
  }

  const { accent } = getDiseaseColor(result.diseaseClass || 'unknown');

  return (
    <div className="space-y-4">
      <div
        className="flex items-center gap-4 rounded-2xl border px-5 py-4 shadow-sm"
        style={{ backgroundColor: `${accent}08`, borderColor: `${accent}20` }}
      >
        <div className="flex-1">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Tình trạng thực thể</p>
          <p className="text-lg font-black text-slate-800">{result.diseaseClass}</p>
        </div>
        <div className="text-right">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Độ tin cậy</p>
          <p className="text-2xl font-black" style={{ color: accent }}>
            {(result.confidence * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            <Droplets className="h-3 w-3" /> Đất trồng
          </p>
          <p className="text-sm leading-relaxed text-slate-700">{result.soilCondition}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600">
            <CheckCircle className="h-3 w-3" /> Khuyến nghị
          </p>
          <p className="text-sm leading-relaxed text-slate-700">{result.careRecommendation}</p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => onOpenDetail(result.diseaseClass)}
          className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50"
        >
          <Eye className="h-4 w-4" />
          Xem chi tiết bệnh
        </button>
      </div>
    </div>
  );
};

export default function ImageAnalysis() {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [isScanning, setIsScanning] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiAnalysisResponse | null>(null);
  const [historyList, setHistoryList] = useState<AnalysisHistoryItem[]>([]);
  const [batchOptions, setBatchOptions] = useState<PlantingBatchOption[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [isDiseaseDrawerOpen, setIsDiseaseDrawerOpen] = useState(false);
  const [drawerDiseaseId, setDrawerDiseaseId] = useState<string | null>(null);
  const [drawerHistoryId, setDrawerHistoryId] = useState<string | null>(null);
  const [drawerImageOverride, setDrawerImageOverride] = useState<string | null>(null);

  const routeBatchId = useMemo(() => {
    if (!batchId) {
      return null;
    }
    const parsed = Number(batchId);
    return Number.isInteger(parsed) && parsed > 0 ? String(parsed) : null;
  }, [batchId]);

  useEffect(() => {
    if (routeBatchId) {
      setSelectedBatchId(routeBatchId);
      return;
    }
    setSelectedBatchId('');
  }, [routeBatchId]);

  useEffect(() => {
    let isMounted = true;

    const loadBatchOptions = async () => {
      setIsBatchLoading(true);
      const options = await aiAnalysisService.getPlantingBatchOptions();
      if (isMounted) {
        setBatchOptions(options);
      }
      if (isMounted) {
        setIsBatchLoading(false);
      }
    };

    void loadBatchOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (!selectedBatchId) {
        if (isMounted) {
          setHistoryList([]);
          setIsHistoryLoading(false);
        }
        return;
      }

      setIsHistoryLoading(true);
      try {
        const history = await aiAnalysisService.getAnalysisHistory(selectedBatchId);
        if (isMounted) {
          setHistoryList(history);
        }
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [selectedBatchId]);

  const selectedBatch = useMemo(
    () => batchOptions.find((item) => String(item.pBatchId) === selectedBatchId),
    [batchOptions, selectedBatchId]
  );

  const headerData = [
    { label: 'Mã lô', value: selectedBatchId || 'N/A' },
    { label: 'Tên lô', value: selectedBatch?.batchName || 'Chưa chọn' },
    { label: 'Vị trí', value: mockWeatherInfo.location },
    { label: 'Ảnh quét', value: historyList.length, unit: 'lần' },
    {
      label: 'Phát hiện',
      value: historyList.filter((h) => !(h.diseaseClass || '').toLowerCase().includes('healthy')).length,
      unit: 'ca',
    },
    { label: 'Nhiệt độ', value: mockWeatherInfo.temperature, unit: '°C' },
    { label: 'Độ ẩm', value: mockWeatherInfo.humidity, unit: '%' },
  ];

  const handleAnalyzeImage = async (file: File) => {
    if (!selectedBatchId) {
      setError('Thiếu mã lô hợp lệ. Không thể gửi yêu cầu phân tích.');
      return;
    }

    setError('');
    setIsScanning(true);
    try {
      const previousHistoryIds = new Set(historyList.map((item) => item.id));

      const result = await aiAnalysisService.analyzeImage(file, selectedBatchId);

      try {
        await saveUploadedDiseaseImage(result.diseaseClass, file);
      } catch (saveImageError) {
        console.warn('Không thể lưu ảnh upload theo loại bệnh:', saveImageError);
      }

      setAiResult(result);
      setDrawerDiseaseId(result.diseaseClass);
      setDrawerHistoryId(null);
      setDrawerImageOverride(null);
      setIsDiseaseDrawerOpen(false);

      try {
        const updatedHistory = await aiAnalysisService.getAnalysisHistory(selectedBatchId);

        const newestHistoryItem =
          updatedHistory.find((item) => !previousHistoryIds.has(item.id) && item.diseaseClass === result.diseaseClass) ||
          updatedHistory.find((item) => !previousHistoryIds.has(item.id));

        if (newestHistoryItem) {
          try {
            await saveUploadedHistoryImage(newestHistoryItem.id, file);
          } catch (saveHistoryImageError) {
            console.warn('Không thể lưu ảnh upload cho bản ghi lịch sử:', saveHistoryImageError);
          }
        }

        setHistoryList(updatedHistory);
      } catch (historyError) {
        console.warn('Failed to refresh history after analysis:', historyError);
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi phân tích ảnh';
      setError(errorMessage);
      alert(`${errorMessage}. Vui lòng thử lại.`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex h-[100svh] flex-col overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/30 font-sans md:h-[100dvh]">
      <header className="z-20 shrink-0 border-b border-slate-200/70 bg-white/85 px-3 py-1.5 backdrop-blur lg:px-4 lg:py-2">
        <div className="flex h-full items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" /> Quay lại
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <div className="min-w-0 flex-1">
            <InfoStrip data={headerData} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-3 lg:p-4">
        <div className="grid h-full min-h-0 grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur lg:col-span-7">
            {error && (
              <div className="mb-4 flex shrink-0 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-3 shrink-0">
              <label htmlFor="batch-select" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Mã lô
              </label>
              <select
                id="batch-select"
                value={selectedBatchId}
                disabled={isBatchLoading}
                onChange={(event) => {
                  const nextBatchId = event.target.value;
                  setSelectedBatchId(nextBatchId);
                  setAiResult(null);
                  setDrawerDiseaseId(null);
                  setDrawerHistoryId(null);
                  setDrawerImageOverride(null);
                  setIsDiseaseDrawerOpen(false);
                  if (nextBatchId) {
                    navigate(`/ai-assistant/${nextBatchId}`);
                  } else {
                    navigate('/ai-assistant');
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Chọn lô trồng để phân tích</option>
                {batchOptions.map((batch) => (
                  <option key={batch.pBatchId} value={String(batch.pBatchId)}>
                    {batch.pBatchId} - {batch.batchName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-h-0">
              <ImageUploadSection onAnalyze={handleAnalyzeImage} isScanning={isScanning} onValidationError={setError} />
            </div>
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur lg:col-span-5">
            <div className="shrink-0">
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Phân tích chi tiết</span>
              </div>

              <ResultSection
                result={aiResult}
                isLoading={isScanning}
                onOpenDetail={(diseaseClass) => {
                  setDrawerDiseaseId(diseaseClass);
                  setDrawerHistoryId(null);
                  setDrawerImageOverride(null);
                  setIsDiseaseDrawerOpen(true);
                }}
              />
            </div>

            <div className="mt-4 min-h-0 flex-1 border-t border-slate-100 pt-4">
              <HistoryListCard
                histories={historyList}
                isLoading={isHistoryLoading}
                onSelectHistory={(historyItem) => {
                  if (!historyItem.diseaseClass) {
                    return;
                  }
                  setDrawerDiseaseId(historyItem.diseaseClass);
                  setDrawerHistoryId(historyItem.id);
                  setDrawerImageOverride(historyItem.analysisImageUrl ?? null);
                  setIsDiseaseDrawerOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      </main>

      <DiseaseDetailDrawer
        isOpen={isDiseaseDrawerOpen}
        onClose={() => setIsDiseaseDrawerOpen(false)}
        diseaseId={drawerDiseaseId}
        historyId={drawerHistoryId}
        imageUrlOverride={drawerImageOverride}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
