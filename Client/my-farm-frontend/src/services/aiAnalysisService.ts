import axios, { AxiosError } from 'axios';
import type {
  AiAnalysisResponse,
  AiAnalysisDto,
  ApiResponse,
  AnalysisHistoryItem,
  ParsedResultJson,
  PlantingBatchOption
} from '../models/AiAnalysis';

// Base URL của Spring Boot API
const API_BASE_URL = 'http://localhost:8080/api';
const API_ORIGIN = new URL(API_BASE_URL).origin;

// Axios instance với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout cho AI analysis
});

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Helper function để kiểm tra API response hợp lệ
function isValidApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    response !== null &&
    typeof response === 'object' &&
    'data' in response &&
    (response as ApiResponse<T>).data !== undefined
  );
}

function normalizeAnalysisImageUrl(imagePath: string | undefined): string | null {
  if (!imagePath || typeof imagePath !== 'string') {
    return null;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `${API_ORIGIN}${trimmed}`;
  }

  return `${API_ORIGIN}/${trimmed.replace(/^\/+/, '')}`;
}

/**
 * Service xử lý các API liên quan đến AI Analysis
 */
export const aiAnalysisService = {
  /**
   * Gửi ảnh lên server để phân tích bằng AI
   * POST /api/ai-analyses/analyze
   *
    * @param file - File ảnh gốc từ người dùng
   * @param batchId - ID của lô trồng
   * @returns Promise<AiAnalysisResponse> - Kết quả phân tích từ AI
   */
  async analyzeImage(file: File, batchId: string): Promise<AiAnalysisResponse> {
    try {
      console.log('📡 aiAnalysisService.analyzeImage called');
      console.log('📁 File:', file.name, file.size, file.type);
      console.log('🏷️ BatchId:', batchId);

      // Validate file type client-side
      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        throw new Error('File phải là ảnh JPG, PNG hoặc WEBP.');
      }

      if (file.size > MAX_IMAGE_SIZE) {
        throw new Error('Kích thước ảnh vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn.');
      }

      const normalizedBatchId = Number(batchId);
      if (!Number.isInteger(normalizedBatchId) || normalizedBatchId <= 0) {
        throw new Error('Mã lô không hợp lệ. Vui lòng chọn lô trồng trước khi phân tích.');
      }

      // Đóng gói file vào FormData
      const formData = new FormData();
      formData.append('imageFile', file);
      formData.append('pBatchId', String(normalizedBatchId));

      console.log('📦 FormData created:', {
        imageFile: file.name,
        pBatchId: batchId
      });
      console.log('🌐 Sending POST to:', `${API_BASE_URL}/ai-analyses/analyze`);

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

      console.log('✅ API Response received:', response.status);
      console.log('📊 Response data:', response.data);

      // Kiểm tra response hợp lệ
      if (!isValidApiResponse<AiAnalysisResponse>(response.data) || !response.data.data) {
        console.error('❌ Invalid API response structure:', response.data);
        throw new Error('Invalid API response: missing data');
      }

      // Trả về data từ ApiResponse wrapper
      return response.data.data;
    } catch (error) {
      console.error('❌ Error in analyzeImage:', error);
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data as ApiResponse<unknown>;

        console.error('📍 Server responded with error:', {
          status,
          message: data?.message || 'Unknown error'
        });

        // Handle specific error codes with user-friendly messages
        switch (status) {
          case 400:
            throw new Error(data?.message || 'File không hợp lệ. Vui lòng chọn ảnh JPG hoặc PNG.');
          case 404:
            throw new Error(data?.message || 'Không tìm thấy lô trồng. Vui lòng kiểm tra lại.');
          case 503:
            throw new Error(data?.message || 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.');
          case 500:
            throw new Error(data?.message || 'Lỗi server. Vui lòng thử lại sau.');
          default:
            throw new Error(`Lỗi ${status}: ${data?.message || 'Unknown error'}`);
        }
      }

      if (axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNREFUSED') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy.');
      }

      throw error;
    }
  },

  /**
   * Lấy danh sách lô trồng cho dropdown chọn Mã lô
   * GET /api/planting-batches
   */
  async getPlantingBatchOptions(): Promise<PlantingBatchOption[]> {
    try {
      const response = await apiClient.get<ApiResponse<PlantingBatchOption[]>>('/planting-batches');

      if (!isValidApiResponse<PlantingBatchOption[]>(response.data)) {
        console.warn('Invalid planting batch response structure, returning empty array');
        return [];
      }

      const data = response.data.data;
      if (!Array.isArray(data)) {
        console.warn('Planting batch response data is not an array, returning empty array');
        return [];
      }

      return data
        .filter((item): item is PlantingBatchOption =>
          Boolean(item) &&
          Number.isInteger(item.pBatchId) &&
          typeof item.batchName === 'string' &&
          item.batchName.trim().length > 0
        )
        .sort((a, b) => b.pBatchId - a.pBatchId);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNREFUSED') {
        console.warn('Backend not available, returning empty planting batch list');
        return [];
      }
      console.error('Error fetching planting batch options:', error);
      return [];
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
      return data
        .map((dto) => transformDtoToHistoryItem(dto))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

      return data
        .map((dto) => transformDtoToHistoryItem(dto))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    analysisImageUrl: normalizeAnalysisImageUrl(dto.imagePath),
  };
}

export default aiAnalysisService;
