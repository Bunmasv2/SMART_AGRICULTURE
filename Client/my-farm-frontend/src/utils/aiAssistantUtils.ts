import type { AiAnalysisDto } from '../models/AiAnalysis';
import { normalizeWorkflowStatus } from '../services/aiAnalysisService';

export type WorkflowStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type WorkflowStatusFilter = 'ALL' | WorkflowStatus;

export function toWorkflowStatus(raw: string | undefined): WorkflowStatus {
  const normalized = normalizeWorkflowStatus(raw);
  if (normalized === 'PROCESSING' || normalized === 'COMPLETED' || normalized === 'FAILED') {
    return normalized;
  }
  return 'PENDING';
}

export function formatDateTime(value: string | undefined): string {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toShortText(value: string | null | undefined, maxLength = 72): string {
  const text = (value ?? '').trim();
  if (!text) {
    return 'Chưa có dữ liệu';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function statusLabel(status: WorkflowStatus): string {
  switch (status) {
    case 'PROCESSING':
      return 'Đang phân tích';
    case 'COMPLETED':
      return 'Đã phân tích';
    case 'FAILED':
      return 'Phân tích thất bại';
    case 'PENDING':
    default:
      return 'Đang chờ xử lý';
  }
}

export function statusClassName(status: WorkflowStatus): string {
  switch (status) {
    case 'PROCESSING':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'COMPLETED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'FAILED':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'PENDING':
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

export function workerCanSeeFinalResult(item: AiAnalysisDto): boolean {
  return toWorkflowStatus(typeof item.workflowStatus === 'string' ? item.workflowStatus : undefined) === 'COMPLETED'
    && item.finalResult === true;
}

export function confidencePercent(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--';
  }

  const percent = value <= 1 ? value * 100 : value;
  return `${Math.round(percent)}%`;
}