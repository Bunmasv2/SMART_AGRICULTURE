import { useState } from 'react';
import {
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import StageProgressBar from '../../components/bar/StageProgressBar';
import LogCard from '../../components/cards/LogCard';
import WorkflowStageCard from '../../components/cards/WorkflowStageCard';
import { getCurrentStage, getDaysSinceStart, getTotalDays } from '../../utils/DataUitls';
import type { Batch, BatchLog } from '../../models/Batch';
import type { WorkflowStage } from '../../models/Task';

const MOCK_BATCH: Batch = {
    p_batch_id: 2,
    batch_name: "Lô C2-2026",
    crop_name: "Chanh Bông Tím",
    variety: "Giống địa phương",
    area_m2: 350,
    start_date: "2025-12-15",
    expected_harvest: "2026-06-15",
    status: "WARNING",
    farmer: "Nguyễn Văn Kiệt",
    location: "Ấp 3, Xã Tân Hưng, Cái Bè, Tiền Giang",
    notes: "Lô trồng thử nghiệm giống địa phương, cần theo dõi sát sâu vẽ bùa.",
};

const WORKFLOW_STAGES: WorkflowStage[] = [
    {
        stage_id: 1,
        name: "Chuẩn bị & Trồng",
        icon: "🌱",
        color: "#10b981",
        day_start: 0,
        day_end: 14,
        status: "COMPLETED",
        details: [
            { day: 0, task: "Làm đất, bón lót phân hữu cơ (20kg/100m²)", done: true },
            { day: 1, task: "Đào hố, cách nhau 2m×3m", done: true },
            { day: 2, task: "Trồng cây con, tưới nước định vị", done: true },
            { day: 7, task: "Kiểm tra tỷ lệ cây sống, dặm bổ sung", done: true },
            { day: 14, task: "Bón phân NPK 16-16-8 lần 1 (5kg/100m²)", done: true },
        ]
    },
    {
        stage_id: 2,
        name: "Sinh trưởng Thân Lá",
        icon: "🍃",
        color: "#3b82f6",
        day_start: 15,
        day_end: 60,
        status: "COMPLETED",
        details: [
            { day: 15, task: "Phun thuốc phòng ngừa sâu vẽ bùa lần 1", done: true },
            { day: 21, task: "Tỉa cành tạo tán, định hình bộ khung", done: true },
            { day: 30, task: "Bón thúc lần 2, tưới phân bón lá", done: true },
            { day: 45, task: "Kiểm tra rễ, phòng ngừa nấm Phytophthora", done: true },
            { day: 60, task: "Đánh giá sinh trưởng, chuẩn bị kích thích ra hoa", done: true },
        ]
    },
    {
        stage_id: 3,
        name: "Kích Thích Ra Hoa",
        icon: "🌸",
        color: "#f59e0b",
        day_start: 61,
        day_end: 90,
        status: "IN_PROGRESS",
        details: [
            { day: 61, task: "Xiết nước 7-10 ngày để kích thích ra hoa", done: true },
            { day: 68, task: "Phun KNO3 (0.5%) kết hợp Ethephon", done: true },
            { day: 72, task: "Bắt đầu tưới trở lại, bón lân cao (P2O5)", done: true },
            { day: 80, task: "⚠️ AI phát hiện sâu vẽ bùa mật độ cao - cần xử lý", done: false, alert: true },
            { day: 85, task: "Phun Abamectin 1.8EC xử lý sâu vẽ bùa", done: false },
            { day: 90, task: "Đánh giá kết quả ra hoa, chụp ảnh báo cáo", done: false },
        ]
    },
    {
        stage_id: 4,
        name: "Đậu Trái & Nuôi Trái",
        icon: "🍋",
        color: "#8b5cf6",
        day_start: 91,
        day_end: 150,
        status: "UPCOMING",
        details: [
            { day: 91, task: "Bón phân Kali cao để tăng đậu trái", done: false },
            { day: 100, task: "Tỉa trái lần 1, để 3-4 trái/cành", done: false },
            { day: 120, task: "Phòng ngừa bệnh loét do vi khuẩn Xanthomonas", done: false },
            { day: 135, task: "Bón Canxi-Bo để tránh nứt trái", done: false },
            { day: 150, task: "Đánh giá chất lượng trái, dự báo sản lượng", done: false },
        ]
    },
    {
        stage_id: 5,
        name: "Thu Hoạch",
        icon: "🧺",
        color: "#ec4899",
        day_start: 151,
        day_end: 182,
        status: "UPCOMING",
        details: [
            { day: 151, task: "Ngừng bón phân đạm trước thu hoạch 30 ngày", done: false },
            { day: 160, task: "Kiểm tra độ Brix, đánh giá độ chín", done: false },
            { day: 170, task: "Thu hoạch đợt 1 (trái đạt chuẩn kích thước)", done: false },
            { day: 178, task: "Thu hoạch đợt 2, phân loại, đóng gói", done: false },
            { day: 182, task: "Tổng kết sản lượng, ghi chép báo cáo", done: false },
        ]
    },
];

const BATCH_LOGS: BatchLog[] = [
    { log_id: 1, event_type: "STATUS_CHANGE", content: "Lô được khởi tạo, bắt đầu giai đoạn chuẩn bị đất.", created_at: "2025-12-15 08:00", created_by: "Nguyễn Văn Kiệt", image_url: null },
    { log_id: 2, event_type: "TASK_COMPLETED", content: "Hoàn thành làm đất và bón lót 20kg phân hữu cơ/100m².", created_at: "2025-12-15 14:30", created_by: "Nguyễn Văn Kiệt", image_url: "📷" },
    { log_id: 3, event_type: "TASK_COMPLETED", content: "Trồng xong 175 cây con. Tỷ lệ sống ước tính 98%.", created_at: "2025-12-17 09:15", created_by: "Nguyễn Văn Kiệt", image_url: "📷" },
    { log_id: 4, event_type: "TASK_COMPLETED", content: "Hoàn thành bón NPK lần 1, tỉa cành tạo tán cơ bản.", created_at: "2025-12-29 11:00", created_by: "Nguyễn Văn Kiệt", image_url: null },
    { log_id: 5, event_type: "TASK_COMPLETED", content: "Kích thích ra hoa: Đã xiết nước 7 ngày, phun KNO3 thành công.", created_at: "2026-02-21 08:45", created_by: "Nguyễn Văn Kiệt", image_url: "📷" },
    { log_id: 6, event_type: "AI_WARNING", content: "⚠️ Camera AI phát hiện mật độ sâu vẽ bùa vượt ngưỡng 3 con/lá tại khu vực B3. Khuyến nghị: Phun Abamectin 1.8EC ngay.", created_at: "2026-03-12 07:22", created_by: "Hệ thống AI", image_url: "🤖" },
    { log_id: 7, event_type: "SENSOR_ALERT", content: "Cảm biến đất: Độ ẩm xuống 18% (ngưỡng cảnh báo 20%). Cần tưới bổ sung.", created_at: "2026-03-18 14:55", created_by: "IoT Sensor", image_url: null },
];

type BatchDetailProps = {
    batchId: number;
    onBack: () => void;
}

const STATUS_COLOR = {
    ACTIVE: '#10b981',
    WARNING: '#f59e0b',
    HARVESTING: '#010101',
    COMPLETED: '#94a3b8'
};

export default function BatchDetail({ batchId, onBack }: BatchDetailProps) {
    const batch = MOCK_BATCH;
    const [activeTab, setActiveTab] = useState('workflow');
    const [expandedStage, setExpandedStage] = useState<number | null>(3);

    const currentDay = getDaysSinceStart(batch.start_date);
    const currentStage = getCurrentStage(currentDay, WORKFLOW_STAGES);
    const totalDays = getTotalDays(WORKFLOW_STAGES);
    const daysUntilHarvest = Math.max(0, Math.floor((new Date(batch.expected_harvest).getTime() - new Date().getTime())
        / (1000 * 60 * 60 * 24)
    )
    );
    const progressPct = Math.min(100, Math.round((currentDay / (WORKFLOW_STAGES[WORKFLOW_STAGES.length - 1].day_end)) * 100));
    const statusColor = STATUS_COLOR[batch.status as keyof typeof STATUS_COLOR] || '#94a3b8';
    
    return (
        <div key={batchId} className="min-h-screen bg-white font-['Be_Vietnam_Pro',_sans-serif] flex flex-col">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');`}</style>
            <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm w-full">
                <div className="px-4 flex items-center gap-3 h-12">
                    <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 flex-shrink-0">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>

                    <div className="flex-1 min-w-0 flex items-center gap-2">
                        <h1 className="font-extrabold text-slate-900 text-base whitespace-nowrap">
                            {batch.batch_name}
                        </h1>

                        <span className="text-slate-300 flex-shrink-0">|</span>

                        <p className="text-xs text-slate-500 truncate font-medium">
                            {batch.crop_name} • {batch.variety}
                        </p>

                        <div className={`h-3 w-3 rounded-full flex-shrink-0 animate-pulse`} style={{ backgroundColor: statusColor }} />
                    </div>
                </div>
            </div>

            <div className="w-full px-0 pb-10 flex-1 overflow-y-auto space-y-0">
                <div className="bg-slate-50 border-b border-slate-100 p-5">
                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">
                            <span>Tiến độ tổng thể</span>
                            <span className="text-slate-900">{progressPct}%</span>
                        </div>
                        <StageProgressBar stages={WORKFLOW_STAGES} currentDay={currentDay} />
                        <div className="flex justify-between text-[10px] mt-3 font-mono font-bold text-slate-400">
                            <span>{batch.start_date}</span>
                            <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                NGÀY {currentDay} / {totalDays}
                            </div>
                            <span>{batch.expected_harvest}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                        {[
                            { label: "Ngày trồng", value: `N${currentDay}`, icon: "📅" },
                            { label: "Diện tích", value: `${batch.area_m2}m²`, icon: "🏡" },
                            { label: "Còn lại", value: `${daysUntilHarvest} ngày`, icon: "⏳" },
                            { label: "Giai đoạn", value: currentStage.name.split(' ').slice(-1)[0], icon: currentStage.icon },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-4 flex flex-col items-center justify-center">
                                <span className="text-xs text-slate-400 font-bold uppercase mb-1">{item.label}</span>
                                <span className="text-lg font-black text-slate-800">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sticky top-[61px] z-10 bg-white border-b border-slate-100 flex w-full">
                    {[
                        { id: 'workflow', label: 'QUY TRÌNH', count: null },
                        { id: 'history', label: 'NHẬT KÝ', count: BATCH_LOGS.length },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 text-xs font-black tracking-widest transition-all relative
                                ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`}
                        >
                            {tab.label} {tab.count && `(${tab.count})`}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-4 bg-white">
                    {activeTab === 'workflow' && (
                        <div className="space-y-4">
                            <div className="bg-emerald-600 rounded-2xl p-5 text-white flex items-center justify-between shadow-lg shadow-emerald-100">
                                <div>
                                    <p className="text-[10px] font-bold opacity-80 uppercase">Đang thực hiện</p>
                                    <h2 className="text-xl font-black">{currentStage.name}</h2>
                                    <p className="text-xs mt-1 opacity-90 font-medium">Kết thúc sau {currentStage.day_end - currentDay} ngày</p>
                                </div>
                                <span className="text-4xl">{currentStage.icon}</span>
                            </div>

                            <div className="space-y-3 pt-2">
                                {WORKFLOW_STAGES.map(stage => (
                                    <WorkflowStageCard
                                        key={stage.stage_id}
                                        stage={stage}
                                        currentDay={currentDay}
                                        isExpanded={expandedStage === stage.stage_id}
                                        onToggle={() => setExpandedStage(expandedStage === stage.stage_id ? null : stage.stage_id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            {[...BATCH_LOGS].reverse().map(log => (
                                <LogCard key={log.log_id} log={log} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
