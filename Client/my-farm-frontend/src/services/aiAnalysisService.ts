import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type {
  AiAnalysisResponse,
  AiAnalysisDto,
  ApiResponse,
  AnalysisHistoryItem,
  ParsedResultJson,
  PlantingBatchOption,
} from '../models/AiAnalysis';

const API_BASE_STORAGE_KEY = 'smart-agriculture:api-base-url';
const DEFAULT_API_PORT = '8080';
const MANUAL_API_BASE_URL =
  typeof import.meta.env.VITE_API_BASE_URL === 'string' ? import.meta.env.VITE_API_BASE_URL.trim() : '';

function sanitizeApiBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

function getStoredApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const stored = window.localStorage.getItem(API_BASE_STORAGE_KEY);
  return typeof stored === 'string' ? stored.trim() : '';
}

function persistApiBaseUrl(baseUrl: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!baseUrl) {
    window.localStorage.removeItem(API_BASE_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(API_BASE_STORAGE_KEY, baseUrl);
}

function buildApiBaseCandidates(): string[] {
  if (MANUAL_API_BASE_URL) {
    return [sanitizeApiBaseUrl(MANUAL_API_BASE_URL)];
  }

  const hosts = new Set<string>(['localhost', '127.0.0.1']);
  if (typeof window !== 'undefined' && window.location.hostname) {
    hosts.add(window.location.hostname);
  }

  const candidateUrls: string[] = [];
  hosts.forEach((host) => {
    candidateUrls.push(`http://${host}:${DEFAULT_API_PORT}/api`);
    candidateUrls.push(`http://${host}:5280/api`);
    candidateUrls.push(`https://${host}:7225/api`);
  });

  return Array.from(new Set(candidateUrls.map((item) => sanitizeApiBaseUrl(item))));
}

const API_BASE_CANDIDATES = buildApiBaseCandidates();
const DEFAULT_API_BASE_URL = API_BASE_CANDIDATES[0] ?? `http://localhost:${DEFAULT_API_PORT}/api`;
const storedApiBaseUrl = sanitizeApiBaseUrl(getStoredApiBaseUrl());
let activeApiBaseUrl = API_BASE_CANDIDATES.includes(storedApiBaseUrl) ? storedApiBaseUrl : DEFAULT_API_BASE_URL;

function getApiOrigin(): string {
  try {
    return new URL(activeApiBaseUrl).origin;
  } catch {
    return `http://localhost:${DEFAULT_API_PORT}`;
  }
}

const apiClientCache = new Map<string, ReturnType<typeof axios.create>>();

function getApiClient(baseUrl: string) {
  const normalizedBaseUrl = sanitizeApiBaseUrl(baseUrl);
  const existingClient = apiClientCache.get(normalizedBaseUrl);
  if (existingClient) {
    return existingClient;
  }

  const nextClient = axios.create({
    baseURL: normalizedBaseUrl,
    timeout: 30000,
  });

  apiClientCache.set(normalizedBaseUrl, nextClient);
  return nextClient;
}

function isRecoverableNetworkError(error: unknown): boolean {
  const axiosError = error as AxiosError;
  return axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNREFUSED' || !axiosError.response;
}

function setActiveApiBaseUrl(nextBaseUrl: string): void {
  const normalized = sanitizeApiBaseUrl(nextBaseUrl);
  activeApiBaseUrl = normalized;
  persistApiBaseUrl(normalized);
}

async function requestWithFailover<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  const fallbackCandidates = MANUAL_API_BASE_URL
    ? [activeApiBaseUrl]
    : [activeApiBaseUrl, ...API_BASE_CANDIDATES.filter((candidate) => candidate !== activeApiBaseUrl)];

  let lastError: unknown = new Error('Không có API endpoint khả dụng.');

  for (const baseUrl of fallbackCandidates) {
    try {
      const response = await getApiClient(baseUrl).request<T>(config);
      if (baseUrl !== activeApiBaseUrl) {
        setActiveApiBaseUrl(baseUrl);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (!isRecoverableNetworkError(error)) {
        break;
      }
    }
  }

  throw lastError;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

type WorkflowEventType =
  | 'connected'
  | 'heartbeat'
  | 'image_uploaded'
  | 'analysis_processing'
  | 'analysis_completed'
  | 'analysis_failed'
  | 'analysis_deleted'
  | 'image_replaced'
  | 'final_result_updated';

export interface AiWorkflowEvent {
  eventType: WorkflowEventType | string;
  message: string;
  pBatchId: number;
  analysisId?: number;
  item?: AiAnalysisDto | null;
}

export interface AiListQuery {
  order?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

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
    return `${getApiOrigin()}${trimmed}`;
  }

  return `${getApiOrigin()}/${trimmed.replace(/^\/+/, '')}`;
}

function parseResultJson(resultJson: string | undefined): Partial<ParsedResultJson> {
  if (!resultJson || typeof resultJson !== 'string') {
    return {};
  }

  try {
    return JSON.parse(resultJson) as ParsedResultJson;
  } catch {
    return {};
  }
}

function parseBooleanFlag(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }

    if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === '') {
      return false;
    }
  }

  return fallback;
}

export function normalizeWorkflowStatus(rawStatus: string | undefined, fallbackDiseaseClass?: string | null): string {
  if (rawStatus && typeof rawStatus === 'string' && rawStatus.trim().length > 0) {
    return rawStatus.toUpperCase();
  }

  if (fallbackDiseaseClass) {
    return 'COMPLETED';
  }

  return 'PENDING';
}

export function enrichAnalysisDto(dto: AiAnalysisDto): AiAnalysisDto {
  const parsed = parseResultJson(dto.resultJson);
  const diseaseClass = dto.diseaseClass ?? parsed.disease_class ?? null;
  const confidence = dto.confidence ?? parsed.confidence ?? null;
  const soilCondition = dto.soilCondition ?? parsed.soil_condition ?? null;
  const careRecommendation = dto.careRecommendation ?? parsed.care_recommendation ?? null;
  const finalResult = dto.finalResult == null
    ? parseBooleanFlag(parsed.is_final_result, false)
    : parseBooleanFlag(dto.finalResult, false);
  const normalizedImagePath = normalizeAnalysisImageUrl(dto.imagePath) ?? dto.imagePath;
  const normalizedThumbnailPath =
    normalizeAnalysisImageUrl(dto.thumbnailPath ?? parsed.thumbnail_path ?? undefined) ?? normalizedImagePath;

  return {
    ...dto,
    imagePath: normalizedImagePath,
    thumbnailPath: normalizedThumbnailPath,
    uploadedBy: dto.uploadedBy ?? parsed.uploaded_by ?? 'Worker',
    workflowStatus: normalizeWorkflowStatus(
      typeof dto.workflowStatus === 'string' ? dto.workflowStatus : parsed.workflow_status,
      diseaseClass
    ),
    diseaseClass,
    confidence,
    soilCondition,
    careRecommendation,
    workerNote: dto.workerNote ?? parsed.worker_note ?? null,
    adminNote: dto.adminNote ?? parsed.admin_note ?? null,
    finalResult,
    analyzedAt: dto.analyzedAt ?? parsed.analyzed_at ?? null,
    errorMessage: dto.errorMessage ?? parsed.error_message ?? null,
  };
}

function toHistoryItem(dto: AiAnalysisDto): AnalysisHistoryItem {
  const enriched = enrichAnalysisDto(dto);
  return {
    id: String(enriched.analysisId ?? `temp-${Date.now()}`),
    date: enriched.createdAt || new Date().toISOString(),
    diseaseClass: enriched.diseaseClass ?? null,
    batchId: enriched.pBatchId?.toString() || 'N/A',
    batchName: enriched.batchName || `Lô ${enriched.pBatchId || 'N/A'}`,
    analysisImageUrl: normalizeAnalysisImageUrl(enriched.imagePath),
    thumbnailImageUrl: normalizeAnalysisImageUrl(enriched.thumbnailPath ?? enriched.imagePath),
    uploadedBy: enriched.uploadedBy ?? 'Worker',
    workflowStatus: typeof enriched.workflowStatus === 'string' ? enriched.workflowStatus : 'PENDING',
    confidence: enriched.confidence ?? null,
    soilCondition: enriched.soilCondition ?? null,
    careRecommendation: enriched.careRecommendation ?? null,
    workerNote: enriched.workerNote ?? null,
    adminNote: enriched.adminNote ?? null,
    finalResult: Boolean(enriched.finalResult),
    errorMessage: enriched.errorMessage ?? null,
  };
}

function mapAxiosError(error: unknown): never {
  const axiosError = error as AxiosError;

  if (axiosError.response) {
    const status = axiosError.response.status;
    const data = axiosError.response.data as ApiResponse<unknown>;

    switch (status) {
      case 400:
        throw new Error(data?.message || 'Dữ liệu gửi lên không hợp lệ.');
      case 404:
        throw new Error(data?.message || 'Không tìm thấy bản ghi hoặc lô trồng.');
      case 503:
        throw new Error(data?.message || 'Dịch vụ AI tạm thời không khả dụng.');
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

function validateImageFile(file: File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    throw new Error('File phải là ảnh JPG, PNG hoặc WEBP.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Kích thước ảnh vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn.');
  }
}

function ensureValidBatchId(batchId: string): number {
  const parsed = Number(batchId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('Mã lô không hợp lệ. Vui lòng chọn lô trồng trước khi thao tác.');
  }
  return parsed;
}

/**
 * Service xử lý các API liên quan đến AI Analysis
 */
export const aiAnalysisService = {
  /**
   * Legacy endpoint: gửi ảnh và phân tích ngay.
   */
  async analyzeImage(file: File, batchId: string): Promise<AiAnalysisResponse> {
    try {
      validateImageFile(file);
      const normalizedBatchId = ensureValidBatchId(batchId);

      const formData = new FormData();
      formData.append('imageFile', file);
      formData.append('pBatchId', String(normalizedBatchId));

      const response = await requestWithFailover<ApiResponse<AiAnalysisResponse>>({
        method: 'post',
        url: '/ai-analyses/analyze',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!isValidApiResponse<AiAnalysisResponse>(response.data) || !response.data.data) {
        throw new Error('Invalid API response: missing data');
      }

      return response.data.data;
    } catch (error) {
      mapAxiosError(error);
    }
  },

  async getPlantingBatchOptions(): Promise<PlantingBatchOption[]> {
    try {
      const response = await requestWithFailover<ApiResponse<PlantingBatchOption[]>>({
        method: 'get',
        url: '/planting-batches',
      });

      if (!isValidApiResponse<PlantingBatchOption[]>(response.data)) {
        return [];
      }

      const data = response.data.data;
      if (!Array.isArray(data)) {
        return [];
      }

      return data
        .filter((item): item is PlantingBatchOption =>
          Boolean(item) &&
          Number.isInteger(item.pBatchId) &&
          typeof item.batchName === 'string' &&
          item.batchName.trim().length > 0
        )
        .sort((a, b) => a.pBatchId - b.pBatchId);
    } catch (error) {
      mapAxiosError(error);
    }
  },

  async getLeafItemsByBatch(
    batchId: string,
    orderOrQuery: 'asc' | 'desc' | AiListQuery = 'asc'
  ): Promise<AiAnalysisDto[]> {
    try {
      const normalizedBatchId = ensureValidBatchId(batchId);
      const query: AiListQuery = typeof orderOrQuery === 'string'
        ? { order: orderOrQuery }
        : orderOrQuery;

      const response = await requestWithFailover<ApiResponse<AiAnalysisDto[]>>({
        method: 'get',
        url: '/ai-analyses',
        params: {
          pBatchId: normalizedBatchId,
          order: query.order ?? 'asc',
          ...(Number.isInteger(query.page) ? { page: Math.max(0, Number(query.page)) } : {}),
          ...(Number.isInteger(query.size) ? { size: Math.max(1, Number(query.size)) } : {}),
        },
      });

      if (!isValidApiResponse<AiAnalysisDto[]>(response.data)) {
        return [];
      }

      const data = response.data.data;
      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((item) => enrichAnalysisDto(item));
    } catch (error) {
      mapAxiosError(error);
    }
  },

  async uploadWorkerImages(batchId: string, files: File[], workerNote = ''): Promise<AiAnalysisDto[]> {
    try {
      const normalizedBatchId = ensureValidBatchId(batchId);

      if (!Array.isArray(files) || files.length === 0) {
        throw new Error('Bạn cần chọn ít nhất 1 ảnh.');
      }

      if (files.length > 2) {
        throw new Error('Mỗi lần xác nhận chỉ được gửi tối đa 2 ảnh.');
      }

      files.forEach(validateImageFile);

      const formData = new FormData();
      formData.append('pBatchId', String(normalizedBatchId));
      files.forEach((file) => formData.append('imageFiles', file));
      if (workerNote.trim()) {
        formData.append('workerNote', workerNote.trim());
      }

      const response = await requestWithFailover<ApiResponse<AiAnalysisDto[]>>({
        method: 'post',
        url: '/ai-analyses/uploads',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!isValidApiResponse<AiAnalysisDto[]>(response.data) || !Array.isArray(response.data.data)) {
        throw new Error('Invalid API response when uploading images.');
      }

      return response.data.data.map((item) => enrichAnalysisDto(item));
    } catch (error) {
      mapAxiosError(error);
    }
  },

  async analyzeById(analysisId: number, adminNote = ''): Promise<AiAnalysisDto> {
    try {
      const response = await requestWithFailover<ApiResponse<AiAnalysisDto>>({
        method: 'post',
        url: `/ai-analyses/${analysisId}/analyze`,
        params: adminNote.trim() ? { adminNote: adminNote.trim() } : undefined,
      });

      if (!isValidApiResponse<AiAnalysisDto>(response.data) || !response.data.data) {
        throw new Error('Invalid API response when analyzing image.');
      }

      return enrichAnalysisDto(response.data.data);
    } catch (error) {
      mapAxiosError(error);
    }
  },

  async analyzeAll(batchId: string, adminNote = ''): Promise<AiAnalysisDto[]> {
    try {
      const normalizedBatchId = ensureValidBatchId(batchId);
      const response = await requestWithFailover<ApiResponse<AiAnalysisDto[]>>({
        method: 'post',
        url: '/ai-analyses/analyze-all',
        params: {
          pBatchId: normalizedBatchId,
          ...(adminNote.trim() ? { adminNote: adminNote.trim() } : {}),
        },
      });

      if (!isValidApiResponse<AiAnalysisDto[]>(response.data) || !Array.isArray(response.data.data)) {
        throw new Error('Invalid API response when analyzing all images.');
      }

      return response.data.data.map((item) => enrichAnalysisDto(item));
    } catch (error) {
      mapAxiosError(error);
    }
  },

  async retryById(analysisId: number, adminNote = ''): Promise<AiAnalysisDto> {
    try {
      const response = await requestWithFailover<ApiResponse<AiAnalysisDto>>({
        method: 'post',
        url: `/ai-analyses/${analysisId}/retry`,
        params: adminNote.trim() ? { adminNote: adminNote.trim() } : undefined,
      });

      if (!isValidApiResponse<AiAnalysisDto>(response.data) || !response.data.data) {
        throw new Error('Invalid API response when retrying image analysis.');
      }

      return enrichAnalysisDto(response.data.data);
    } catch (error) {
      mapAxiosError(error);
    }
  },

  async replaceImage(analysisId: number, file: File, workerNote = ''): Promise<AiAnalysisDto> {
    try {
      validateImageFile(file);
      const formData = new FormData();
      formData.append('imageFile', file);
      if (workerNote.trim()) {
        formData.append('workerNote', workerNote.trim());
      }

      const response = await requestWithFailover<ApiResponse<AiAnalysisDto>>({
        method: 'post',
        url: `/ai-analyses/${analysisId}/replace-image`,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!isValidApiResponse<AiAnalysisDto>(response.data) || !response.data.data) {
        throw new Error('Invalid API response when replacing image.');
      }

      return enrichAnalysisDto(response.data.data);
    } catch (error) {
      mapAxiosError(error);
    }
  },

  async selectFinalResult(analysisId: number): Promise<AiAnalysisDto> {
    try {
      const response = await requestWithFailover<ApiResponse<AiAnalysisDto>>({
        method: 'post',
        url: `/ai-analyses/${analysisId}/final`,
      });

      if (!isValidApiResponse<AiAnalysisDto>(response.data) || !response.data.data) {
        throw new Error('Invalid API response when selecting final result.');
      }

      return enrichAnalysisDto(response.data.data);
    } catch (error) {
      mapAxiosError(error);
    }
  },

  async deleteLeafItem(analysisId: number): Promise<void> {
    try {
      await requestWithFailover({
        method: 'delete',
        url: `/ai-analyses/${analysisId}`,
      });
    } catch (error) {
      mapAxiosError(error);
    }
  },

  subscribeToBatchStream(
    batchId: string,
    onEvent: (event: AiWorkflowEvent) => void,
    onError?: (error: Event) => void
  ): () => void {
    const normalizedBatchId = ensureValidBatchId(batchId);
    const streamUrl = `${getApiOrigin()}/api/ai-analyses/stream?pBatchId=${normalizedBatchId}`;
    const eventSource = new EventSource(streamUrl);

    const handleEvent = (event: MessageEvent<string>) => {
      if (!event.data) {
        return;
      }

      try {
        const parsed = JSON.parse(event.data) as AiWorkflowEvent;
        onEvent({
          ...parsed,
          eventType: parsed.eventType || event.type,
          item: parsed.item ? enrichAnalysisDto(parsed.item) : parsed.item,
        });
      } catch {
        // Ignore malformed SSE payloads.
      }
    };

    const eventNames: WorkflowEventType[] = [
      'connected',
      'heartbeat',
      'image_uploaded',
      'analysis_processing',
      'analysis_completed',
      'analysis_failed',
      'analysis_deleted',
      'image_replaced',
      'final_result_updated',
    ];

    eventNames.forEach((name) => {
      eventSource.addEventListener(name, handleEvent as EventListener);
    });

    eventSource.onmessage = handleEvent;
    eventSource.onerror = (error) => {
      onError?.(error);
    };

    return () => {
      eventNames.forEach((name) => {
        eventSource.removeEventListener(name, handleEvent as EventListener);
      });
      eventSource.close();
    };
  },

  async getAnalysisHistory(batchId: string): Promise<AnalysisHistoryItem[]> {
    const items = await this.getLeafItemsByBatch(batchId, 'asc');
    return items.map((item) => toHistoryItem(item));
  },

  async getAllAnalysisHistory(): Promise<AnalysisHistoryItem[]> {
    try {
      const response = await requestWithFailover<ApiResponse<AiAnalysisDto[]>>({
        method: 'get',
        url: '/ai-analyses',
        params: { order: 'asc' },
      });

      if (!isValidApiResponse<AiAnalysisDto[]>(response.data) || !Array.isArray(response.data.data)) {
        return [];
      }

      return response.data.data.map((dto) => toHistoryItem(dto));
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNREFUSED') {
        return [];
      }
      mapAxiosError(error);
    }
  },
};

export default aiAnalysisService;
