// Response từ API phân tích ảnh (POST /api/ai-analyses/analyze)
export interface AiAnalysisResponse {
  diseaseClass: string;
  confidence: number;
  soilCondition: string;
  careRecommendation: string;
}

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
  resultJson: string;
  createdAt: string;
}

// Parsed resultJson từ AiAnalysisDto
export interface ParsedResultJson {
  disease_class: string;
  confidence: number;
  soil_condition: string;
  care_recommendation: string;
}

// Item hiển thị trong lịch sử (transformed từ AiAnalysisDto)
export interface AnalysisHistoryItem {
  id: string;
  date: string;
  diseaseClass: string | null;
  batchId: string;
  batchName: string;
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
