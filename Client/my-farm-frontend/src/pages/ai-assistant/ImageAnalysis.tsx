import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ImageUploadScanner } from '../../components/cards/ImageUploadScanner';
import { WeatherCard } from '../../components/cards/WeatherCard';
import { AnalysisResultCard } from '../../components/cards/AnalysisResultCard';
import { HistoryListCard } from '../../components/cards/HistoryListCard';
import ErrorBoundary from '../../components/ErrorBoundary';
import { mockWeatherInfo } from '../../utils/DataUitls';
import { aiAnalysisService } from '../../services/aiAnalysisService';
import type { AiAnalysisResponse, AnalysisHistoryItem, WeatherInfo } from '../../models/AiAnalysis';

export default function ImageAnalysis() {
  // Lấy batchId từ URL params (VD: /ai-assistant/:batchId)
  const { batchId } = useParams<{ batchId: string }>();

  // State Management
  const [isScanning, setIsScanning] = useState(false);
  const [aiResult, setAiResult] = useState<AiAnalysisResponse | null>(null);
  const [historyList, setHistoryList] = useState<AnalysisHistoryItem[]>([]);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo>(mockWeatherInfo);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lifecycle: Fetch dữ liệu khi component mount hoặc batchId thay đổi
   * - Lấy lịch sử phân tích từ API
   * - Lấy thông tin thời tiết (hiện tại dùng mock data)
   */
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      setIsLoadingHistory(true);
      setError(null);

      try {
        // Fetch lịch sử phân tích
        let history: AnalysisHistoryItem[] = [];

        if (batchId) {
          history = await aiAnalysisService.getAnalysisHistory(batchId);
        } else {
          // Nếu không có batchId, lấy tất cả lịch sử
          history = await aiAnalysisService.getAllAnalysisHistory();
        }

        // Chỉ update state nếu component vẫn mounted
        if (isMounted) {
          setHistoryList(history);
          // TODO: Khi có API weather thực tế, thay thế mock data
          setWeatherInfo(mockWeatherInfo);
        }

      } catch (err) {
        console.error('Error fetching initial data:', err);

        if (isMounted) {
          // Fallback về mock data nếu API fail
          setWeatherInfo(mockWeatherInfo);
          setHistoryList([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    };

    fetchInitialData();

    // Cleanup function để tránh memory leak
    return () => {
      isMounted = false;
    };
  }, [batchId]);

  /**
   * Xử lý phân tích ảnh bằng AI
   * 1. Gọi API analyzeImage
   * 2. Cập nhật kết quả vào state
   * 3. Refresh lịch sử phân tích
   */
  const handleAnalyzeImage = async (file: File) => {
    // Validate batchId
    const currentBatchId = batchId || '1'; // Default batch nếu không có

    console.log('Analyzing image:', file.name, 'for batch:', currentBatchId);

    // Bắt đầu scanning
    setIsScanning(true);
    setError(null);

    try {
      // Gọi API phân tích ảnh
      const result = await aiAnalysisService.analyzeImage(file, currentBatchId);

      // Cập nhật kết quả phân tích
      setAiResult(result);

      // Refresh lịch sử sau khi phân tích thành công (vì backend vừa lưu record mới)
      try {
        const updatedHistory = await aiAnalysisService.getAnalysisHistory(currentBatchId);
        setHistoryList(updatedHistory);
      } catch (historyError) {
        console.warn('Failed to refresh history after analysis:', historyError);
      }

      console.log('Analysis successful:', result);

    } catch (err) {
      // Xử lý lỗi
      console.error('Error analyzing image:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi phân tích ảnh';
      setError(errorMessage);

      // Hiển thị thông báo lỗi cho user
      alert(errorMessage + '. Vui lòng thử lại.');

    } finally {
      // Luôn tắt trạng thái scanning
      setIsScanning(false);
    }
  };

  // Hiển thị batchId trong tiêu đề nếu có
  const headerTitle = batchId
    ? `Trợ lý AI | Phân tích Lá cây Lô trồng #${batchId}`
    : 'Trợ lý AI | Phân tích Lá cây Lô trồng';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {headerTitle}
          </h1>
          <p className="text-gray-600">
            Sử dụng công nghệ AI để phát hiện bệnh và đưa ra khuyến nghị chăm sóc
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">Lỗi: {error}</p>
          </div>
        )}

        {/* Grid Layout - 2 columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column (lg:col-span-1) */}
          <div className="space-y-6">
            {/* Image Upload & Scanner */}
            <ErrorBoundary>
              <ImageUploadScanner
                onAnalyze={handleAnalyzeImage}
                isScanning={isScanning}
              />
            </ErrorBoundary>

            {/* Weather Info */}
            <ErrorBoundary>
              <WeatherCard
                weather={weatherInfo}
                batchId={batchId || 'N/A'}
              />
            </ErrorBoundary>
          </div>

          {/* Right Column (lg:col-span-1) */}
          <div className="space-y-6">
            {/* Analysis Result */}
            <ErrorBoundary>
              <AnalysisResultCard
                result={aiResult}
                isLoading={isScanning}
              />
            </ErrorBoundary>

            {/* History List */}
            <ErrorBoundary>
              <HistoryListCard
                histories={historyList}
                isLoading={isLoadingHistory}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
