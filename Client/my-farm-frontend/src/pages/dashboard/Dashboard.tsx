import { 
    CloudIcon, 
    ExclamationTriangleIcon, 
    CheckCircleIcon,
    MapPinIcon,
    BeakerIcon,
    CpuChipIcon,
    CalendarDaysIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import React from 'react';

export default function SmartFarmDashboard() {
    return (
        <div className="min-h-screen bg-[#f8faf7] p-4 md:p-8 text-slate-900 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header: Đậm chất hiện đại */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-lime-500 w-2 h-2 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-wider text-lime-700">Live Farm Data</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-800">
                            Citus<span className="text-[#2c9b4e]">Hub</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Hệ thống quản trị vườn Chanh Không Hạt • Niên vụ 2026</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                            <CalendarDaysIcon className="h-6 w-6 text-slate-600" />
                        </button>
                        <button className="bg-[#2c9b4e] hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-green-200 flex items-center gap-2 active:scale-95">
                            <span>+ Thêm Công Việc</span>
                        </button>
                    </div>
                </header>

                {/* Main Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Weather Widget: Glassmorphism style */}
                    <div className="md:col-span-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-100">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between h-full">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 bg-white/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/30">
                                    <MapPinIcon className="h-4 w-4" />
                                    <span className="text-sm font-semibold uppercase tracking-wide">Khu vực: Long An, VN</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-7xl font-black">28°C</h2>
                                        <CloudIcon className="h-16 w-16 opacity-80" />
                                    </div>
                                    <p className="text-blue-100 text-lg font-medium mt-2">Nhiều mây • Độ ẩm đất: 75% (Lý tưởng)</p>
                                </div>
                            </div>
                            
                            <div className="mt-8 md:mt-0 md:w-1/2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col justify-center">
                                <div className="flex items-start gap-3">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-300 shrink-0" />
                                    <div>
                                        <p className="font-bold text-white">Cảnh báo rủi ro</p>
                                        <p className="text-sm text-blue-50 leading-relaxed mt-1">
                                            Dự báo mưa lớn vào 15:00 ngày mai. Đề xuất kiểm tra hệ thống thoát nước tại <strong>Lô 04 & 05</strong> ngay sáng nay.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Background Decoration */}
                        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    {/* Quick Stats: Mini Bento */}
                    <div className="md:col-span-4 grid grid-cols-2 gap-4">
                        <QuickStat value="12" label="Lô Trồng" icon={<MapPinIcon />} color="green" />
                        <QuickStat value="08" label="Nhiệm vụ" icon={<CheckCircleIcon />} color="blue" />
                        <QuickStat value="02" label="Vật tư" icon={<BeakerIcon />} color="yellow" />
                        <QuickStat value="01" label="Cảnh báo AI" icon={<CpuChipIcon />} color="red" />
                    </div>

                    {/* Plots Progress: Custom UI List */}
                    <div className="md:col-span-7 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Trạng thái Sinh trưởng</h3>
                            <button className="text-sm font-bold text-[#2c9b4e] hover:underline">Chi tiết tất cả</button>
                        </div>
                        <div className="space-y-6">
                            <PlotItem name="Lô 01 - Chanh Bông Tím" stage="Nuôi trái" progress={85} health="high" />
                            <PlotItem name="Lô 02 - Chanh Không Hạt" stage="Ra hoa" progress={45} health="medium" />
                            <PlotItem name="Lô 03 - Chanh Giấy" stage="Cây con" progress={20} health="high" />
                        </div>
                    </div>

                    {/* AI Insights: The "Magic" Card */}
                    <div className="md:col-span-5 bg-[#1a2e1d] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-lime-400 mb-6">
                                <SparklesIcon className="h-6 w-6" />
                                <h3 className="text-lg font-bold tracking-tight italic">AI Assistant Insight</h3>
                            </div>
                            <div className="space-y-5">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
                                    <p className="text-sm text-lime-100 leading-relaxed font-medium">
                                        <span className="text-lime-400 font-bold">● Lô 02:</span> Phát hiện bất thường qua camera lúc 08:24. Hình thái lá nghi nhiễm <span className="underline decoration-lime-500">Sâu vẽ bùa</span>.
                                    </p>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
                                    <p className="text-sm text-lime-100 leading-relaxed font-medium">
                                        <span className="text-lime-400 font-bold">● Tối ưu tưới:</span> Độ ẩm Lô 01 đạt 85%. Đã tự động điều chỉnh giảm 20% lượng nước tưới chiều nay.
                                    </p>
                                </div>
                            </div>
                            <button className="mt-8 w-full py-3 bg-lime-500 hover:bg-lime-400 text-green-950 rounded-xl font-black transition-all shadow-lg shadow-lime-900/20 active:scale-95">
                                XEM CHIẾN LƯỢC CHĂM SÓC
                            </button>
                        </div>
                        {/* Matrix-like decorative bg */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                            <div className="text-[10px] font-mono leading-none break-all">
                                {Array(20).fill("0101110010101010111010").join(" ")}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

interface QuickStatProps {
    value: string;
    label: string;
    icon: React.ReactElement<{ className?: string }>;
    color: 'green' | 'blue' | 'yellow' | 'red';
}

// Sub-components với thiết kế tối giản
function QuickStat({ value, label, icon, color }: QuickStatProps) {
    const colors = {
        green: "bg-green-50 text-green-600 border-green-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        yellow: "bg-orange-50 text-orange-600 border-orange-100",
        red: "bg-red-50 text-red-600 border-red-100",
    };

    return (
        <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-${color}-200 transition-all hover:shadow-lg`}>
            <div className={`p-3 rounded-2xl mb-3 transition-transform group-hover:scale-110 ${colors[color]}`}>
                {/* Clone icon to set size */}
                {React.cloneElement(icon, { className: "h-6 w-6" })}
            </div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">{label}</p>
        </div>
    );
}

interface PlotItemProps {
    name: string;
    stage: string;
    progress: number;
    health: 'high' | 'low' | string;
}

function PlotItem({ name, stage, progress, health }: PlotItemProps) {
    return (
        <div className="group cursor-pointer">
            <div className="flex justify-between items-end mb-2 px-1">
                <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-[#2c9b4e] transition-colors">{name}</h4>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Giai đoạn: {stage}</p>
                </div>
                <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${health === 'high' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {health === 'high' ? '• Ổn định' : '• Cần chú ý'}
                </div>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner border border-slate-50">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${health === 'high' ? 'bg-gradient-to-r from-green-400 to-[#2c9b4e]' : 'bg-gradient-to-r from-yellow-300 to-orange-400'}`} 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}