// Response từ API phân tích ảnh (POST /api/ai-analyses/analyze)
export interface AiAnalysisResponse {
  diseaseClass: string;
  confidence: number;
  soilCondition: string;
  careRecommendation: string;
}

export type AiWorkflowStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// Wrapper response từ Spring Boot API
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// DTO lịch sử phân tích từ backend (GET /api/ai-analyses)
export interface AiAnalysisDto {
  analysisId: number;
  pBatchId: number;
  batchName: string;
  imagePath: string;
  thumbnailPath?: string | null;
  resultJson: string;
  createdAt: string;
  uploadedBy?: string | null;
  workflowStatus?: AiWorkflowStatus | string;
  diseaseClass?: string | null;
  confidence?: number | null;
  soilCondition?: string | null;
  careRecommendation?: string | null;
  workerNote?: string | null;
  adminNote?: string | null;
  finalResult?: boolean;
  analyzedAt?: string | null;
  errorMessage?: string | null;
}

// Parsed resultJson từ AiAnalysisDto
export interface ParsedResultJson {
  workflow_status?: AiWorkflowStatus | string;
  disease_class: string;
  confidence: number;
  soil_condition: string;
  care_recommendation: string;
  thumbnail_path?: string;
  uploaded_by?: string;
  worker_note?: string;
  admin_note?: string;
  is_final_result?: boolean | string | number;
  analyzed_at?: string;
  error_message?: string;
}

// Item hiển thị trong lịch sử (transformed từ AiAnalysisDto)
export interface AnalysisHistoryItem {
  id: string;
  date: string;
  diseaseClass: string | null;
  batchId: string;
  batchName: string;
  analysisImageUrl?: string | null;
  thumbnailImageUrl?: string | null;
  uploadedBy?: string | null;
  workflowStatus?: AiWorkflowStatus | string;
  confidence?: number | null;
  soilCondition?: string | null;
  careRecommendation?: string | null;
  workerNote?: string | null;
  adminNote?: string | null;
  finalResult?: boolean;
  errorMessage?: string | null;
}

// Thông tin thời tiết (mock data - chưa có API)
export interface WeatherInfo {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
}

// DTO lô trồng dùng cho dropdown chọn Mã lô
export interface PlantingBatchOption {
  pBatchId: number;
  batchName: string;
  status?: string;
}
