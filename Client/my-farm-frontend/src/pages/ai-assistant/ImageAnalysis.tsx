import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Upload, RefreshCw, CheckCircle, AlertCircle,
  Eye, Plus, Droplets, ScanLine, ChevronLeft
} from 'lucide-react';
import { useRef } from 'react';
import aiAnalysisService from '../../services/aiAnalysisService';
import { HistoryListCard } from '../../components/cards/HistoryListCard';
import type {
  AiAnalysisResponse,
  AnalysisHistoryItem,
  WeatherInfo,
  PlantingBatchOption,
} from '../../models/AiAnalysis';

// ─── Types & Mock Data ──────────────────────────────────────────────────
interface InfoItem {
  label: string;
  value: string | number;
  unit?: string;
}

const mockWeatherInfo: WeatherInfo = { condition: 'Nắng nhẹ', temperature: 28, humidity: 72, location: 'Vĩnh Long, Việt Nam' };
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const getDiseaseColor = (cls: string) => {
  const n = cls.toLowerCase();
  if (n.includes('healthy')) return { accent: '#10b981', label: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (n.includes('deficiency') || n.includes('dry')) return { accent: '#f59e0b', label: 'bg-amber-50 text-amber-700 border-amber-200' };
  return { accent: '#ef4444', label: 'bg-red-50 text-red-700 border-red-200' };
};

// ─── Scanning Overlay ──────────────────────────────────────────────────────
const ScanningOverlay = () => (
  <>
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full border border-cyan-400/30 animate-ping" />
        <div className="w-16 h-16 rounded-full border-2 border-cyan-400 flex items-center justify-center"
          style={{ animation: 'pulseCircle 2s ease-in-out infinite' }}>
          <ScanLine className="w-7 h-7 text-cyan-300" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Đang phân tích</p>
        <div className="flex gap-1.5 justify-center mt-2">
          {[0, 0.2, 0.4].map((d, i) => (
            <span key={i} className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
          style={{ animation: 'scanLine 2.5s ease-in-out infinite' }} />
      </div>
    </div>
    <style>{`
      @keyframes scanLine { 0%{top:-5%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:105%;opacity:0} }
      @keyframes pulseCircle { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
    `}</style>
  </>
);

// ─── Image Upload Section ──────────────────────────────────────────────────
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
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
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
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <Upload className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tải ảnh phân tích</span>
      </div>

      <div
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        className={`relative flex-1 rounded-xl overflow-hidden transition-all duration-200 min-h-[300px] ${!previewUrl
          ? 'border-2 border-dashed border-slate-200 hover:border-emerald-400 cursor-pointer bg-slate-50 hover:bg-emerald-50/30'
          : 'bg-slate-100 border border-slate-200'
          }`}
      >
        {!previewUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">Kéo thả hoặc click để chọn ảnh</p>
              <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG (Tối đa 10MB)</p>
            </div>
          </div>
        ) : (
          <>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            {isScanning && <ScanningOverlay />}
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          validateAndSetImage(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div className="flex gap-2 mt-4 shrink-0">
        {!previewUrl ? (
          <button onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-3 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Chọn ảnh mới
          </button>
        ) : (
          <>
            <button
              onClick={() => selectedFile && !isScanning && onAnalyze(selectedFile)}
              disabled={!selectedFile || isScanning}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isScanning
                ? 'bg-slate-100 text-slate-400'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}>
              {isScanning ? 'Đang xử lý...' : <><ScanLine className="w-4 h-4" /> Bắt đầu phân tích</>}
            </button>
            {!isScanning && (
              <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                className="px-4 py-3 text-slate-500 hover:text-red-500 border border-slate-200 rounded-lg hover:bg-red-50 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Shared Info Strip Component ──────────────────────────────────────────
const InfoStrip = ({ data, className = "" }: { data: InfoItem[]; className?: string }) => (
  <div className={`flex items-center divide-x divide-slate-100 h-full w-full ${className}`}>
    {data.map((item, i) => (
      <div 
        key={i} 
        className="flex-1 flex items-center justify-center gap-2 px-2 whitespace-nowrap"
      >
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          {item.label}:
        </span>
        <span className="text-[11px] font-bold text-slate-700">
          {item.value}
          {item.unit && (
            <span className="ml-0.5 text-[9px] font-normal text-slate-400 lowercase">
              {item.unit}
            </span>
          )}
        </span>
      </div>
    ))}
  </div>
);

// ─── Result Section ────────────────────────────────────────────────────────
const ResultSection = ({ result, isLoading }: { result: AiAnalysisResponse | null; isLoading: boolean }) => {
  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-20 bg-slate-50 rounded-xl" /><div className="h-32 bg-slate-50 rounded-xl" /></div>;
  if (!result) return (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-xl text-slate-300">
      <Eye className="w-12 h-12 mb-2 opacity-20" />
      <p className="text-sm font-medium">Kết quả phân tích sẽ hiển thị tại đây</p>
    </div>
  );

  const { accent } = getDiseaseColor(result.diseaseClass || 'unknown');
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 px-5 py-4 rounded-xl border" style={{ backgroundColor: `${accent}08`, borderColor: `${accent}20` }}>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Tình trạng thực thể</p>
          <p className="text-lg font-black text-slate-800">{result.diseaseClass}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Độ tin cậy</p>
          <p className="text-2xl font-black" style={{ color: accent }}>{(result.confidence * 100).toFixed(0)}%</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center gap-1.5"><Droplets className="w-3 h-3"/> Đất trồng</p>
          <p className="text-sm text-slate-700 leading-relaxed">{result.soilCondition}</p>
        </div>
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
          <p className="text-[10px] font-black uppercase text-emerald-600 mb-1 flex items-center gap-1.5"><CheckCircle className="w-3 h-3"/> Khuyến nghị</p>
          <p className="text-sm text-slate-700 leading-relaxed">{result.careRecommendation}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
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

  // Dữ liệu dùng chung cho cả Header và Sub-header
  const headerData = [
    { label: 'Mã lô', value: selectedBatchId || 'N/A' },
    { label: 'Tên lô', value: selectedBatch?.batchName || 'Chưa chọn' },
    { label: 'Vị trí', value: mockWeatherInfo.location },
    { label: 'Ảnh quét', value: historyList.length, unit: 'lần' },
    { label: 'Phát hiện', value: historyList.filter(h => !(h.diseaseClass || '').toLowerCase().includes('healthy')).length, unit: 'ca' },
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
      console.log('📡 Calling API...');
      // Gọi API phân tích ảnh
      const result = await aiAnalysisService.analyzeImage(file, selectedBatchId);

      console.log('✅ Analysis successful:', result);
      // Cập nhật kết quả phân tích
      setAiResult(result);

      // Refresh lịch sử sau khi phân tích thành công (vì backend vừa lưu record mới)
      try {
        const updatedHistory = await aiAnalysisService.getAnalysisHistory(selectedBatchId);
        setHistoryList(updatedHistory);

      } catch (historyError) {
        console.warn('Failed to refresh history after analysis:', historyError);
      }

    } catch (err) {
      // Xử lý lỗi
      console.error('❌ Error analyzing image:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi phân tích ảnh';
      setError(errorMessage);

      // Hiển thị thông báo lỗi cho user
      alert(errorMessage + '. Vui lòng thử lại.');

    } finally {
      // Luôn tắt trạng thái scanning
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50/20 overflow-hidden font-sans">
      
      {/* ── HEADER CHÍNH ── */}
      <header className="flex items-center border-b border-slate-100 bg-white z-20 shrink-0 h-12">
        <div className="flex items-center px-4 border-r border-slate-100 h-full">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </button>
        </div>
        <InfoStrip data={headerData} className="bg-slate-50/40 flex-1" />
      </header>

      {/* ── NỘI DUNG CHÍNH ── */}
      <main className="flex-1 flex items-stretch divide-x divide-slate-100 overflow-hidden">
        
        {/* CỘT TRÁI: Upload + Sub-Header */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 p-8 overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 flex items-center gap-2 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="batch-select" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
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
                  if (nextBatchId) {
                    navigate(`/ai-assistant/${nextBatchId}`);
                  } else {
                    navigate('/ai-assistant');
                  }
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Chọn lô trồng để phân tích</option>
                {batchOptions.map((batch) => (
                  <option key={batch.pBatchId} value={String(batch.pBatchId)}>
                    {batch.pBatchId} - {batch.batchName}
                  </option>
                ))}
              </select>
            </div>

            <ImageUploadSection
              onAnalyze={handleAnalyzeImage}
              isScanning={isScanning}
              onValidationError={setError}
            />
          </div>
          
          {/* Bottom padding decor */}
          <div className="h-16 bg-gradient-to-t from-slate-50/50 to-transparent shrink-0" />
        </div>

        {/* CỘT PHẢI: Kết quả + Lịch sử */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Result Area */}
          <div className="p-8 shrink-0">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phân tích chi tiết</span>
            </div>
            <ResultSection result={aiResult} isLoading={isScanning} />
          </div>

          {/* History Area */}
          <div className="flex-1 min-h-0 px-8 pb-8 flex flex-col overflow-hidden">
            <div className="border-t border-slate-100 pt-6 h-full flex flex-col">
              <HistoryListCard histories={historyList} isLoading={isHistoryLoading} />
            </div>
          </div>
        </div>

      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}