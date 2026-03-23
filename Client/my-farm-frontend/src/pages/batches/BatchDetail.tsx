import { useEffect, useState } from 'react';
import {
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import StageProgressBar from '../../components/bar/StageProgressBar';
import LogCard from '../../components/cards/LogCard';
import WorkflowStageCard from '../../components/cards/WorkflowStageCard';
import { formatDate, getCurrentStage, getDaysSinceStart, getExpectedDate } from '../../utils/DataUitls';
import type { Batch, BatchLog } from '../../models/Batch';
import type { WorkflowStage } from '../../models/Task';
import axios from 'axios';
import type { GrowthProcessBase } from '../../models/GrowthProcess';
import { useNavigate, useParams } from 'react-router-dom';
import { STAGE_CONFIG } from '../../utils/IconUtils';

const BATCH_LOGS: BatchLog[] = [
    { log_id: 1, event_type: "STATUS_CHANGE", content: "Lô được khởi tạo, bắt đầu giai đoạn chuẩn bị đất.", created_at: "2025-12-15 08:00", created_by: "Nguyễn Văn Kiệt", image_url: null },
    { log_id: 2, event_type: "TASK_COMPLETED", content: "Hoàn thành làm đất và bón lót 20kg phân hữu cơ/100m².", created_at: "2025-12-15 14:30", created_by: "Nguyễn Văn Kiệt", image_url: "📷" },
    { log_id: 3, event_type: "TASK_COMPLETED", content: "Trồng xong 175 cây con. Tỷ lệ sống ước tính 98%.", created_at: "2025-12-17 09:15", created_by: "Nguyễn Văn Kiệt", image_url: "📷" },
    { log_id: 4, event_type: "TASK_COMPLETED", content: "Hoàn thành bón NPK lần 1, tỉa cành tạo tán cơ bản.", created_at: "2025-12-29 11:00", created_by: "Nguyễn Văn Kiệt", image_url: null },
    { log_id: 5, event_type: "TASK_COMPLETED", content: "Kích thích ra hoa: Đã xiết nước 7 ngày, phun KNO3 thành công.", created_at: "2026-02-21 08:45", created_by: "Nguyễn Văn Kiệt", image_url: "📷" },
    { log_id: 6, event_type: "AI_WARNING", content: "⚠️ Camera AI phát hiện mật độ sâu vẽ bùa vượt ngưỡng 3 con/lá tại khu vực B3. Khuyến nghị: Phun Abamectin 1.8EC ngay.", created_at: "2026-03-12 07:22", created_by: "Hệ thống AI", image_url: "🤖" },
    { log_id: 7, event_type: "SENSOR_ALERT", content: "Cảm biến đất: Độ ẩm xuống 18% (ngưỡng cảnh báo 20%). Cần tưới bổ sung.", created_at: "2026-03-18 14:55", created_by: "IoT Sensor", image_url: null },
];

const STATUS_COLOR = {
    ACTIVE: '#10b981',
    WARNING: '#f59e0b',
    HARVESTING: '#010101',
    COMPLETED: '#94a3b8'
};

export default function BatchDetail() {
    const [batch, setBatch] = useState<Batch | null>()
    const [growthProcess, setGrowthProcess] = useState<GrowthProcessBase | null>()
    const [stages, setStages] = useState<WorkflowStage[]>()
    const [activeTab, setActiveTab] = useState('workflow');
    const [expandedStage, setExpandedStage] = useState<number | null>(3);
    const { id } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBatchDetail = async () => {
            try {
                const reponse = await axios.get(`http://localhost:8080/api/planting-batches/${id}`)
                setBatch(reponse.data.data)
            } catch (error) {
                console.log(error)
            }
        }

        fetchBatchDetail()
    }, [id])

    useEffect(() => {
        if (!batch?.processId) return;

        const fetchData = async () => {
            try {
                const [processRes, stagesRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/growth-processes/detail/${batch.processId}`),
                    axios.get(`http://localhost:8080/api/stages/process/${batch.processId}`)
                ]);

                setGrowthProcess(processRes.data.data);
                setStages(stagesRes.data.data)
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [batch?.processId]);

    if (!growthProcess || !batch || !stages) return

    const currentDay = getDaysSinceStart(batch.startDate);
    const currentStage = getCurrentStage(currentDay, stages);
    const progressPct = Math.min(100, Math.round((currentDay / (stages[stages.length - 1].endDay)) * 100));
    const statusColor = STATUS_COLOR[batch.status as keyof typeof STATUS_COLOR] || '#94a3b8';

    return (
        <div key={id} className="min-h-screen bg-white font-['Be_Vietnam_Pro',_sans-serif] flex flex-col overflow-x-hidden">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');`}</style>
            <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm w-full">
                <div className="px-4 flex items-center gap-3 h-12">
                    <button onClick={() => navigate("/batches")} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 flex-shrink-0">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>

                    <div className="flex-1 min-w-0 flex items-center gap-2">
                        <h1 className="font-extrabold text-slate-900 text-base whitespace-nowrap">
                            {batch.batchName}
                        </h1>

                        <span className="text-slate-300 flex-shrink-0">|</span>

                        <p className="text-xs text-slate-500 truncate font-medium">
                            {batch.cropName} • {batch.variety}
                        </p>

                        <div className={`h-3 w-3 rounded-full flex-shrink-0 animate-pulse`} style={{ backgroundColor: statusColor }} />
                    </div>
                </div>
            </div>

            <div className="w-full flex-1  bg-slate-50/30">
                <div className="bg-white border-b border-slate-100 p-6">
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tiến độ tổng thể</span>
                            <span className="text-lg font-black text-slate-800">{progressPct}%</span>
                        </div>
                        <StageProgressBar stages={growthProcess.stages} totalDays={growthProcess.totalDays} currentDay={currentDay} />
                        <div className="flex justify-between items-center text-[10px] mt-4 font-mono font-bold text-slate-400">
                            <span>{formatDate(batch.startDate)}</span>
                            <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                                NGÀY {currentDay} / {growthProcess.totalDays}
                            </span>
                            <span className="text-slate-600">
                                {getExpectedDate(batch.startDate, growthProcess.totalDays)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-100 divide-x divide-y md:divide-y-0 divide-slate-100 rounded-xl bg-slate-50/50">
                        {[
                            { label: "Ngày trồng", value: `N${currentDay}`, icon: "📅" },
                            { label: "Diện tích", value: `${batch.areaM2}m²`, icon: "🏡" },
                            { label: "Còn lại", value: `${growthProcess.totalDays - currentDay} ngày`, icon: "⏳" },
                            {
                                label: "Giai đoạn",
                                value: currentStage?.stageName?.split(' ').slice(-1)[0],
                                icon: STAGE_CONFIG[currentStage?.stageId || 0]?.icon || "📌"
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-5 flex flex-col justify-center bg-white hover:bg-slate-50/50 transition-colors">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <span>{item.icon}</span> {item.label}
                                </span>
                                <span className="text-lg font-black text-slate-800">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sticky top-[73px] z-10 bg-white border-b border-slate-100 flex w-full px-6 gap-6">
                    {[
                        { id: 'workflow', label: 'QUY TRÌNH', count: null },
                        { id: 'history', label: 'NHẬT KÝ', count: BATCH_LOGS.length },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 text-[11px] font-bold tracking-widest uppercase transition-all relative
                                ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab.label} {tab.count && `(${tab.count})`}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-emerald-500" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6 max-w-4xl mx-auto">
                    {activeTab === 'workflow' && stages && (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {stages.map(stage => (
                                    <WorkflowStageCard
                                        key={stage.stageId}
                                        stage={stage}
                                        currentDay={currentDay}
                                        isExpanded={expandedStage === stage.stageId}
                                        onToggle={() => setExpandedStage(expandedStage === stage.stageId ? null : stage.stageId)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-3">
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
