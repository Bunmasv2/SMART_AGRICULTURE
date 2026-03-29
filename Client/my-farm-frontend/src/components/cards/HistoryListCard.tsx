import { FileText } from 'lucide-react';
import type { AnalysisHistoryItem } from '../../models/AiAnalysis';
import { getDiseaseColorConfig } from '../../utils/AiColorUtils';

interface HistoryListCardProps {
  histories: AnalysisHistoryItem[];
  isLoading?: boolean;
  onSelectHistory?: (history: AnalysisHistoryItem) => void;
}

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Lịch sử Phân tích
      </h3>

      <div className="overflow-y-auto max-h-64 space-y-3">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
                <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : safeHistories.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
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
              const colorConfig = getDiseaseColorConfig(item.diseaseClass);
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
                  className={`flex items-start gap-3 p-3 rounded-lg border border-gray-100 transition-all duration-200 ${
                    canOpenDetail
                      ? 'cursor-pointer hover:border-gray-200 hover:shadow-sm focus-within:ring-2 focus-within:ring-emerald-200'
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
                  {/* Icon with color */}
                  <div className={`${colorConfig.bg} ${colorConfig.text} p-2 rounded-lg`}>
                    <FileText className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${colorConfig.text} truncate`}>
                      {item.diseaseClass || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(item.date)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Lô: {item.batchName || `#${item.batchId || 'N/A'}`}
                    </p>
                    {canOpenDetail && (
                      <p className="text-[11px] text-emerald-600 mt-1 font-medium">Nhấn để xem chi tiết</p>
                    )}
                  </div>
                </div>
              );
            } catch (error) {
              console.error('Error rendering history item:', error, item);
              return (
                <div key={`error-${index}`} className="p-3 bg-red-50 border border-red-200 rounded-lg">
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
