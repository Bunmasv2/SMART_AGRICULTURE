import { Sun, Cloud, Droplets } from 'lucide-react';
import type { WeatherInfo } from '../../models/AiAnalysis';

interface WeatherCardProps {
  weather: WeatherInfo;
  batchId: string;
}

export const WeatherCard = ({ weather, batchId }: WeatherCardProps) => {
  const isSunny = weather.condition.toLowerCase().includes('nắng');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Thông tin Lô trồng
      </h3>

      <div className="space-y-4">
        {/* Batch ID */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Mã Lô:</span>
          <span className="text-sm font-medium text-gray-900">{batchId}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Vị trí:</span>
          <span className="text-sm font-medium text-gray-900">{weather.location}</span>
        </div>

        {/* Weather Condition */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
          {isSunny ? (
            <Sun className="w-8 h-8 text-yellow-500" />
          ) : (
            <Cloud className="w-8 h-8 text-gray-400" />
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-600">{weather.condition}</p>
            <p className="text-2xl font-bold text-gray-900">{weather.temperature}°C</p>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <Droplets className="w-6 h-6 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Độ ẩm</p>
            <p className="text-lg font-semibold text-gray-900">{weather.humidity}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
