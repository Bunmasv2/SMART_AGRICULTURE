import axios, { AxiosError } from 'axios';
import type {
  AiAnalysisResponse,
  AiAnalysisDto,
  ApiResponse,
  AnalysisHistoryItem,
  ParsedResultJson
} from '../models/AiAnalysis';

// Base URL của Spring Boot API
const API_BASE_URL = 'http://localhost:8080/api';

// Axios instance với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout cho AI analysis
});

// Helper function để kiểm tra API response hợp lệ
function isValidApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    response !== null &&
    typeof response === 'object' &&
    'data' in response &&
    (response as ApiResponse<T>).data !== undefined
  );
}

/**
 * Service xử lý các API liên quan đến AI Analysis
 */
export const aiAnalysisService = {
  /**
   * Gửi ảnh lên server để phân tích bằng AI
   * POST /api/ai-analyses/analyze
   *
   * @param file - File ảnh đã resize 224x224
   * @param batchId - ID của lô trồng
   * @returns Promise<AiAnalysisResponse> - Kết quả phân tích từ AI
   */
  async analyzeImage(file: File, batchId: string): Promise<AiAnalysisResponse> {
    try {
      // Đóng gói file vào FormData
      const formData = new FormData();
      formData.append('imageFile', file);
      formData.append('pBatchId', batchId);

      // Gửi request POST với header multipart/form-data
      const response = await apiClient.post<ApiResponse<AiAnalysisResponse>>(
        '/ai-analyses/analyze',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Kiểm tra response hợp lệ
      if (!isValidApiResponse<AiAnalysisResponse>(response.data) || !response.data.data) {
        throw new Error('Invalid API response: missing data');
      }

      // Trả về data từ ApiResponse wrapper
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNREFUSED') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy.');
      }
      throw error;
    }
  },

  /**
   * Lấy lịch sử phân tích theo batchId
   * GET /api/ai-analyses?pBatchId={batchId}
   *
   * @param batchId - ID của lô trồng
   * @returns Promise<AnalysisHistoryItem[]> - Danh sách lịch sử đã transform
   */
  async getAnalysisHistory(batchId: string): Promise<AnalysisHistoryItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<AiAnalysisDto[]>>(
        '/ai-analyses',
        {
          params: { pBatchId: batchId }
        }
      );

      // Kiểm tra response hợp lệ và data là array
      if (!isValidApiResponse<AiAnalysisDto[]>(response.data)) {
        console.warn('Invalid API response structure, returning empty array');
        return [];
      }

      const data = response.data.data;
      if (!Array.isArray(data)) {
        console.warn('API response data is not an array, returning empty array');
        return [];
      }

      // Transform AiAnalysisDto[] sang AnalysisHistoryItem[]
      return data.map((dto) => transformDtoToHistoryItem(dto));
    } catch (error) {
      const axiosError = error as AxiosError;
      // Network error - backend không chạy
      if (axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNREFUSED') {
        console.warn('Backend not available, returning empty history');
        return [];
      }
      console.error('Error fetching analysis history:', error);
      return [];
    }
  },

  /**
   * Lấy tất cả lịch sử phân tích (không lọc theo batch)
   * GET /api/ai-analyses
   *
   * @returns Promise<AnalysisHistoryItem[]> - Danh sách lịch sử
   */
  async getAllAnalysisHistory(): Promise<AnalysisHistoryItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<AiAnalysisDto[]>>('/ai-analyses');

      // Kiểm tra response hợp lệ và data là array
      if (!isValidApiResponse<AiAnalysisDto[]>(response.data)) {
        console.warn('Invalid API response structure, returning empty array');
        return [];
      }

      const data = response.data.data;
      if (!Array.isArray(data)) {
        console.warn('API response data is not an array, returning empty array');
        return [];
      }

      return data.map((dto) => transformDtoToHistoryItem(dto));
    } catch (error) {
      const axiosError = error as AxiosError;
      // Network error - backend không chạy
      if (axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNREFUSED') {
        console.warn('Backend not available, returning empty history');
        return [];
      }
      console.error('Error fetching all analysis history:', error);
      return [];
    }
  },
};

/**
 * Transform AiAnalysisDto sang AnalysisHistoryItem để hiển thị UI
 * Parse resultJson để lấy thông tin disease_class
 */
function transformDtoToHistoryItem(dto: AiAnalysisDto): AnalysisHistoryItem {
  // Safety checks for dto
  if (!dto || typeof dto !== 'object') {
    console.warn('Invalid DTO received:', dto);
    return {
      id: 'invalid',
      date: new Date().toISOString(),
      diseaseClass: 'Unknown',
      batchId: 'N/A',
      batchName: 'Invalid Data',
    };
  }

  // Parse resultJson để lấy disease_class
  let diseaseClass = 'Unknown';
  try {
    if (dto.resultJson && typeof dto.resultJson === 'string') {
      const parsed: ParsedResultJson = JSON.parse(dto.resultJson);
      diseaseClass = parsed.disease_class || 'Unknown';
    }
  } catch (error) {
    console.warn('Failed to parse resultJson:', dto.resultJson, error);
  }

  return {
    id: dto.analysisId?.toString() || `temp-${Date.now()}`,
    date: dto.createdAt || new Date().toISOString(),
    diseaseClass: diseaseClass,
    batchId: dto.pBatchId?.toString() || 'N/A',
    batchName: dto.batchName || `Lô ${dto.pBatchId || 'N/A'}`,
  };
}

export default aiAnalysisService;
