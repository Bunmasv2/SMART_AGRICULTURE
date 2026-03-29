import {
  AlertTriangle,
  Bug,
  ChevronRight,
  Clock3,
  FileText,
  Leaf,
  ShieldAlert,
} from 'lucide-react';
import type { AnalysisHistoryItem } from '../../models/AiAnalysis';
import type { LucideIcon } from 'lucide-react';

interface HistoryListCardProps {
  histories: AnalysisHistoryItem[];
  isLoading?: boolean;
  onSelectHistory?: (history: AnalysisHistoryItem) => void;
}

interface DiseaseVisual {
  Icon: LucideIcon;
  iconClassName: string;
  iconContainerClassName: string;
  titleClassName: string;
}

const getDiseaseVisual = (diseaseClass: string | null): DiseaseVisual => {
  const normalized = (diseaseClass || '').toLowerCase();

  if (normalized.includes('healthy')) {
    return {
      Icon: Leaf,
      iconClassName: 'text-emerald-600',
      iconContainerClassName: 'bg-emerald-50 border border-emerald-100',
      titleClassName: 'text-emerald-700',
    };
  }

  if (normalized.includes('deficiency') || normalized.includes('dry')) {
    return {
      Icon: AlertTriangle,
      iconClassName: 'text-amber-600',
      iconContainerClassName: 'bg-amber-50 border border-amber-100',
      titleClassName: 'text-amber-700',
    };
  }

  if (normalized.includes('virus')) {
    return {
      Icon: ShieldAlert,
      iconClassName: 'text-sky-600',
      iconContainerClassName: 'bg-sky-50 border border-sky-100',
      titleClassName: 'text-sky-700',
    };
  }

  if (
    normalized.includes('spider') ||
    normalized.includes('mite') ||
    normalized.includes('mould') ||
    normalized.includes('canker') ||
    normalized.includes('blight') ||
    normalized.includes('anthracnose')
  ) {
    return {
      Icon: Bug,
      iconClassName: 'text-rose-600',
      iconContainerClassName: 'bg-rose-50 border border-rose-100',
      titleClassName: 'text-rose-700',
    };
  }

  return {
    Icon: FileText,
    iconClassName: 'text-slate-600',
    iconContainerClassName: 'bg-slate-100 border border-slate-200',
    titleClassName: 'text-slate-700',
  };
};

export const HistoryListCard = ({
  histories,
  isLoading = false,
  onSelectHistory,
}: HistoryListCardProps) => {
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return dateString || 'Invalid date';
    }
  };

  // Safety check for histories prop
  const safeHistories = Array.isArray(histories) ? histories : [];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-800">
          Lịch sử Phân tích
        </h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {safeHistories.length} bản ghi
        </span>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="animate-pulse space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
                <div className="h-9 w-9 rounded-lg bg-slate-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-slate-200"></div>
                  <div className="h-3 w-1/2 rounded bg-slate-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : safeHistories.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Chưa có lịch sử phân tích
          </p>
        ) : (
          safeHistories.map((item, index) => {
            // Safety checks for each item
            if (!item || typeof item !== 'object') {
              console.warn('Invalid history item at index', index, item);
              return null;
            }

            try {
              const visual = getDiseaseVisual(item.diseaseClass);
              const canOpenDetail = Boolean(onSelectHistory && item.diseaseClass);

              const handleSelect = () => {
                if (!canOpenDetail) {
                  return;
                }
                onSelectHistory?.(item);
              };

              return (
                <div
                  key={item.id || `history-${index}`}
                  className={`group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-all duration-200 ${
                    canOpenDetail
                      ? 'cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 focus-within:ring-2 focus-within:ring-emerald-200'
                      : ''
                  }`}
                  onClick={canOpenDetail ? handleSelect : undefined}
                  onKeyDown={
                    canOpenDetail
                      ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleSelect();
                        }
                      }
                      : undefined
                  }
                  role={canOpenDetail ? 'button' : undefined}
                  tabIndex={canOpenDetail ? 0 : undefined}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${visual.iconContainerClassName}`}>
                    <visual.Icon className={`h-5 w-5 ${visual.iconClassName}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`truncate text-sm font-semibold ${visual.titleClassName}`}>
                      {item.diseaseClass || 'Không xác định'}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      Lô: {item.batchName || `#${item.batchId || 'N/A'}`}
                    </p>
                  </div>

                  {canOpenDetail && (
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-emerald-600 group-focus-within:text-emerald-600" />
                  )}
                </div>
              );
            } catch (error) {
              console.error('Error rendering history item:', error, item);
              return (
                <div key={`error-${index}`} className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-red-600 text-sm">Lỗi hiển thị item lịch sử</p>
                </div>
              );
            }
          }).filter(Boolean) // Remove null items
        )}
      </div>
    </div>
  );
};
