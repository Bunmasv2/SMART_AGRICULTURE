import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, CheckCircle, Eye, Plus } from 'lucide-react';
import type { AiAnalysisResponse } from '../../models/AiAnalysis';
import { getDiseaseColorConfig } from '../../utils/AiColorUtils';
import { DiseaseDetailDrawer } from '../slide-overs/DiseaseDetailDrawer';

interface AnalysisResultCardProps {
  result: AiAnalysisResponse | null;
  isLoading: boolean;
}

export const AnalysisResultCard = ({ result, isLoading }: AnalysisResultCardProps) => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleCreateTask = () => {
    navigate('/tasks');
  };

  const getStatusIcon = (diseaseClass: string) => {
    const normalized = diseaseClass.toLowerCase();

    if (normalized.includes('healthy')) {
      return <CheckCircle className="w-6 h-6" />;
    }

    if (normalized.includes('deficiency') || normalized.includes('dry')) {
      return <AlertTriangle className="w-6 h-6" />;
    }

    return <AlertCircle className="w-6 h-6" />;
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <div className="h-10 bg-gray-200 rounded w-28"></div>
            <div className="h-10 bg-gray-200 rounded w-36"></div>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (!result) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400 text-center">
            Hãy tải ảnh lên để bắt đầu phân tích
          </p>
        </div>
      </div>
    );
  }

  // Result State
  const colorConfig = getDiseaseColorConfig(result.diseaseClass);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Kết quả Phân tích
        </h3>

        {/* Disease Status Box */}
        <div className={`${colorConfig.bg} ${colorConfig.text} p-4 rounded-lg mb-6`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(result.diseaseClass)}
            <div className="flex-1">
              <p className="text-sm font-medium opacity-80">Tình trạng</p>
              <p className="text-lg font-bold">{result.diseaseClass}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium opacity-80">Độ tin cậy</p>
              <p className="text-2xl font-bold">{(result.confidence * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-4 mb-6">
          {/* Soil Condition */}
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm font-medium text-gray-600 mb-1">Tình trạng đất</p>
            <p className="text-gray-800">{result.soilCondition}</p>
          </div>

          {/* Recommendation */}
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-sm font-medium text-gray-600 mb-1">Gợi ý chăm sóc</p>
            <p className="text-gray-800">{result.careRecommendation}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Eye className="w-4 h-4" />
            Xem chi tiết
          </button>
          <button
            onClick={handleCreateTask}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Tạo Công việc mới
          </button>
        </div>
      </div>

      <DiseaseDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        diseaseId={result.diseaseClass}
      />
    </>
  );
};
