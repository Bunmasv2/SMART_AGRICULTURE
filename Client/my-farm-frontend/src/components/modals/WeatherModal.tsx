import {
    X, Droplets, Wind, CloudRain,
    MapPin, Navigation, Percent,
    HelpCircle,
    Sun,
    Cloud,
    CloudFog,
    CloudDrizzle,
    Snowflake,
    CloudSnow,
    CloudLightning
} from 'lucide-react';
import type { ReactNode } from 'react';

interface WeatherCurrentData {
    temperature_2m: number;
    weathercode?: number;
    relative_humidity_2m: number;
    windspeed_10m: number;
    precipitation_probability: number;
    precipitation: number;
}

export interface WeatherModalData {
    current: WeatherCurrentData;
    locationCoords?: string;
}

interface WeatherModalProps {
    isOpen: boolean;
    onClose: () => void;
    weatherData: WeatherModalData;
    batchName: string;
}

const getWeatherVisuals = (code: number | undefined) => {
    if (code === undefined) return { Icon: HelpCircle, color: 'text-slate-400' };
    if (code === 0) return { Icon: Sun, color: 'text-amber-500' };
    if (code <= 3) return { Icon: Cloud, color: 'text-slate-400' };
    if (code <= 9) return { Icon: CloudFog, color: 'text-slate-300' };
    if (code <= 19) return { Icon: CloudDrizzle, color: 'text-blue-400' };
    if (code <= 29) return { Icon: CloudRain, color: 'text-blue-500' };
    if (code <= 39) return { Icon: Snowflake, color: 'text-sky-300' };
    if (code <= 49) return { Icon: CloudFog, color: 'text-slate-400' };
    if (code <= 59) return { Icon: CloudDrizzle, color: 'text-blue-400' };
    if (code <= 69) return { Icon: CloudRain, color: 'text-blue-600' };
    if (code <= 79) return { Icon: Snowflake, color: 'text-sky-400' };
    if (code <= 84) return { Icon: CloudRain, color: 'text-blue-500' };
    if (code <= 94) return { Icon: CloudSnow, color: 'text-sky-500' };
    return { Icon: CloudLightning, color: 'text-yellow-600' };
}

function weatherCodeToText(code: number | undefined): string {
    if (code === undefined) return 'Không xác định';
    if (code === 0) return 'Trời quang';
    if (code <= 3) return 'Nhiều mây';
    if (code <= 9) return 'Sương mù nhẹ';
    if (code <= 19) return 'Mưa phùn';
    if (code <= 29) return 'Mưa rào';
    if (code <= 39) return 'Tuyết';
    if (code <= 49) return 'Sương mù';
    if (code <= 59) return 'Mưa phùn';
    if (code <= 69) return 'Mưa vừa đến to';
    if (code <= 79) return 'Tuyết';
    if (code <= 84) return 'Mưa rào';
    if (code <= 94) return 'Tuyết rào';
    return 'Giông bão';
}

export const WeatherModal = ({ isOpen, onClose, weatherData, batchName }: WeatherModalProps) => {
    if (!isOpen) return null;

    const { current } = weatherData;
    const { Icon, color } = getWeatherVisuals(current.weathercode);

    return (
        /* Overlay: Trong suốt để bắt sự kiện click ra ngoài để đóng */
        <div
            className="fixed inset-0 z-[100] bg-transparent"
            onClick={onClose}
        >
            {/* Modal Container: Căn lề phải, cách top một khoảng bằng Header */}
            <div
                className={`
                    absolute top-14 right-4 z-[101] 
                    w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-100 
                    overflow-hidden
                    /* Hiệu ứng Chrome: Xuất phát từ góc trên bên phải */
                    animate-in zoom-in-95 fade-in duration-200 origin-top-right
                `}
                onClick={(e) => e.stopPropagation()} // Ngăn đóng modal khi click bên trong
            >
                {/* Header Modal - Thu gọn lại cho giống Chrome Menu */}
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Thông tin chi tiết</h3>
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{batchName}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                        <X className="h-4 w-4 text-slate-400" />
                    </button>
                </div>

                {/* Body Modal */}
                <div className="p-5">
                    {/* Main Visual: Tối giản diện tích */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-xl bg-slate-50 ${color}`}>
                            <Icon size={32} strokeWidth={2} />
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-slate-800 tracking-tighter">
                                    {current.temperature_2m}
                                </span>
                                <span className="text-lg font-bold text-slate-400">°C</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                                {weatherCodeToText(current.weathercode)}
                            </p>
                        </div>
                    </div>

                    {/* Details Grid: 2 cột gọn gàng */}
                    <div className="grid grid-cols-2 gap-2">
                        <DetailItem
                            icon={<Droplets className="w-3.5 h-3.5 text-blue-500" />}
                            label="Độ ẩm"
                            value={`${current.relative_humidity_2m}%`}
                        />
                        <DetailItem
                            icon={<Wind className="w-3.5 h-3.5 text-emerald-500" />}
                            label="Gió"
                            value={`${current.windspeed_10m} km/h`}
                        />
                        <DetailItem
                            icon={<Percent className="w-3.5 h-3.5 text-amber-500" />}
                            label="Xác suất"
                            value={`${current.precipitation_probability}%`}
                        />
                        <DetailItem
                            icon={<CloudRain className="w-3.5 h-3.5 text-indigo-500" />}
                            label="Lượng mưa"
                            value={`${current.precipitation}mm`}
                        />
                    </div>

                    {/* Location Info */}
                    <div className="mt-5 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Vị trí lô trồng</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg group cursor-default">
                            <span className="text-[10px] font-mono font-bold text-slate-500 tracking-tight">
                                {weatherData.locationCoords || "10.8231, 106.6297"}
                            </span>
                            <Navigation className="w-3 h-3 text-slate-300 group-hover:text-emerald-500 transition-colors rotate-45" />
                        </div>
                    </div>
                </div>

                {/* Footer: Dạng nút bấm nhẹ nhàng hơn */}
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-slate-50 border-t border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 hover:text-slate-700 transition-all"
                >
                    Đóng cửa sổ
                </button>
            </div>
        </div>
    );
};
// Sub-component cho các mục chi tiết
const DetailItem = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
    <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-slate-200 transition-all group">
        <div className="flex items-center gap-2 mb-1">
            {icon}
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
        </div>
        <p className="text-sm font-black text-slate-700">{value}</p>
    </div>
);