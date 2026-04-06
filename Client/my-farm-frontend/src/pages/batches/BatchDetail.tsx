import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import {
    ExclamationCircleIcon
} from '@heroicons/react/24/solid';
import { FileText, Camera, Sun, Cloud, CloudFog, CloudDrizzle, CloudRain, Snowflake, CloudSnow, CloudLightning, HelpCircle } from 'lucide-react';

import StageProgressBar from '../../components/bar/StageProgressBar';
import LogCard from '../../components/cards/LogCard';
import WorkflowStageCard from '../../components/cards/WorkflowStageCard';
import { WeatherModal } from '../../components/modals/WeatherModal';
import { getDayNumber, formatDate, getCurrentStage, getDaysSinceStart, getExpectedDate } from '../../utils/DataUitls';
import { STAGE_CONFIG } from '../../utils/IconUtils';

import type { Batch, BatchLog } from '../../models/Batch';
import type { TaskDto, WorkflowStage } from '../../models/Task';
import type { GrowthProcessBase } from '../../models/GrowthProcess';

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

export default function BatchDetail() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [batch, setBatch] = useState<Batch | null>()
    const [growthProcess, setGrowthProcess] = useState<GrowthProcessBase | null>()
    const [stages, setStages] = useState<WorkflowStage[]>()
    const [tasks, setTasks] = useState<TaskDto[]>([]);
    const [activeTab, setActiveTab] = useState('workflow');
    const [expandedStage, setExpandedStage] = useState<number | null>(3);
    const [showWeatherModal, setShowWeatherModal] = useState(false);
    const [weather, setWeather] = useState<any>()
    const { id } = useParams()
    const navigate = useNavigate()
    const [taskErrors, setTaskErrors] = useState<Record<number, string>>({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // New states for Analysis
    const [aiAnalyses, setAiAnalyses] = useState<any[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const fetchBatchDetail = async () => {
            try {
                const reponse = await axios.get(`http://localhost:8080/api/planting-batches/${id}`)
                setBatch(reponse.data.data)
                console.log(reponse.data.data)
            } catch (error) {
                console.log(error)
            }
        }

        fetchBatchDetail()
    }, [id])

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const reponse = await axios.get(`http://localhost:8080/api/weather-alerts/dashboard/${id}`)

                console.log(reponse.data)
                setWeather(reponse.data.data)
            } catch (error) {
                console.log(error)
            }
        }

        if (id) fetchWeather()
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

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                console.log(id)
                const response = await axios.get(`http://localhost:8080/api/tasks/batch/${id}`);
                setTasks(response.data.data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
        if (id) fetchTasks();
    }, [id]);

    useEffect(() => {
        const fetchAiAnalyses = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/ai-analyses?pBatchId=${id}`);
                setAiAnalyses(response.data.data);
            } catch (error) {
                console.error("Error fetching AI analyses:", error);
            }
        };
        if (id) fetchAiAnalyses();
    }, [id, tasks]); // Refresh when tasks change (potential new upload)

    const handleToggleTask = async (taskId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

        try {
            await axios.patch(`http://localhost:8080/api/tasks/${taskId}/status?status=${newStatus}`, null, {
                headers: {
                    'X-Role-Id': user.roleId
                }
            });

            // clear lỗi nếu thành công
            setTaskErrors(prev => ({ ...prev, [taskId]: '' }));

            // update UI
            setTasks(prev =>
                prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t)
            );

        } catch (error: any) {
            handleApiError(error);
        }
    };

    const handleApiError = (error: any) => {
        if (error?.response?.status === 403) {
            setToastMessage("BẠN KHÔNG CÓ QUYỀN!");
            setShowToast(true);
            return;
        }
        setToastMessage(error?.response?.data?.message || "Đã xảy ra lỗi");
        setShowToast(true);
    };


    const handleSyncTasks = async () => {
        setIsSyncing(true);
        try {
            await axios.post(`http://localhost:8080/api/planting-batches/${id}/sync-tasks`);
            // Refresh tasks
            const response = await axios.get(`http://localhost:8080/api/tasks/batch/${id}`);
            setTasks(response.data.data);
            setToastMessage("Cập nhật nhiệm vụ từ quy trình thành công!");
            setShowToast(true);
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsSyncing(false);
        }
    };

    if (!growthProcess || !batch || !stages) return

    const currentDay = getDaysSinceStart(batch.startDate);
    const currentStage = getCurrentStage(currentDay, stages);
    const completedStageIds = stages.filter(stage => {
        const stageTasks = tasks.filter(task => {
            if (task.stageId === stage.stageId) return true;
            if (!task.stageId && task.plannedDate) {
                const day = getDayNumber(task.plannedDate, batch.startDate);
                return day >= stage.startDay && day <= stage.endDay;
            }
            return false;
        });
        return stageTasks.length > 0 && stageTasks.every(t => t.status === 'COMPLETED');
    }).map(s => s.stageId);

    const lastCompletedStage = [...stages].reverse().find(s => completedStageIds.includes(s.stageId));
    const stageProgressPercent = lastCompletedStage ? (lastCompletedStage.endDay / (stages[stages.length - 1].endDay || 1)) * 100 : 0;
    const timeProgressPercent = (currentDay / (stages[stages.length - 1].endDay || 1)) * 100;
    const progressPct = Math.min(100, Math.round(Math.max(timeProgressPercent, stageProgressPercent)));
    const statusColor = STATUS_COLOR[batch.status as keyof typeof STATUS_COLOR] || '#94a3b8';
    const { Icon: WeatherIcon, color: weatherColor } = getWeatherVisuals(1);

    return (
        <div key={id} className="min-h-screen bg-white font-['Be_Vietnam_Pro',_sans-serif] flex flex-col overflow-x-hidden">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');`}</style>

            <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm w-full">
                <div className="px-4 flex items-center gap-3 h-12">
                    {/* Nút Back */}
                    <button onClick={() => navigate("/batches")} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 flex-shrink-0">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>

                    {/* Thông tin Batch */}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                        <h1 className="font-extrabold text-slate-900 text-base whitespace-nowrap">
                            {batch.batchName}
                        </h1>
                        <span className="text-slate-300 flex-shrink-0">|</span>
                        <p className="text-xs text-slate-500 truncate font-medium">
                            {batch.cropName} • {batch.variety}
                        </p>
                        <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 animate-pulse`} style={{ backgroundColor: statusColor }} />
                    </div>

                    {/* Nút Sync (Chỉ cho Manager/Admin - Giả định Role <= 2) */}
                    {user.roleId <= 2 && (
                        <button
                            onClick={handleSyncTasks}
                            disabled={isSyncing}
                            title="Đồng bộ nhiệm vụ mới từ quy trình"
                            className={`p-2 rounded-lg transition-all ${isSyncing ? 'bg-slate-100 text-slate-300' : 'hover:bg-emerald-50 text-emerald-600'}`}
                        >
                            <ArrowPathIcon className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
                        </button>
                    )}

                    {/* PHẦN MỚI: Icon thời tiết ở góc phải */}
                    <div
                        onClick={() => setShowWeatherModal(true)}
                        className="flex items-center gap-2 pl-3 border-l border-slate-100 ml-auto flex-shrink-0 cursor-pointer hover:bg-slate-50 transition-colors h-full px-2"
                    >
                        {weather &&
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Chi tiết</p>
                                <p className="text-[11px] font-bold text-slate-600 leading-tight">
                                    {weather.weather.current.temperature_2m}°C
                                </p>
                            </div>
                        }
                        <div className={`p-1.5 rounded-md bg-slate-50 ${weatherColor}`}>
                            <WeatherIcon className="h-5 w-5" />
                        </div>
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
                        <StageProgressBar
                            stages={growthProcess.stages}
                            totalDays={growthProcess.totalDays}
                            currentDay={currentDay}
                            completedStageIds={completedStageIds}
                        />
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
                        { id: 'workflow', label: 'QUY TRÌNH', count: tasks.length },
                        { id: 'history', label: 'NHẬT KÝ', count: BATCH_LOGS.length },
                        { id: 'analysis', label: 'PHÂN TÍCH', count: aiAnalyses.length },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 text-[11px] font-bold tracking-widest uppercase transition-all relative
                                ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab.label} {tab.count !== null && `(${tab.count})`}
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
                                {stages.map(stage => {
                                    // Tìm task của giai đoạn này
                                    const stageTasks = tasks.filter(task => {
                                        // 1. Nếu có stageId thì map trực tiếp
                                        if (task.stageId === stage.stageId) return true;

                                        // 2. Nếu không có stageId (task thủ công), map theo ngày dự kiến
                                        if (!task.stageId && task.plannedDate) {
                                            const day = getDayNumber(task.plannedDate, batch.startDate);
                                            return day >= stage.startDay && day <= stage.endDay;
                                        }
                                        return false;
                                    });

                                    // 🔥 tính status stage
                                    const total = stageTasks.length;
                                    const done = stageTasks.filter(t => t.status === 'COMPLETED').length;

                                    let stageStatus = 'PENDING';

                                    if (done === total && total > 0) {
                                        stageStatus = 'DONE';
                                    } else if (currentDay < stage.startDay) {
                                        stageStatus = 'SOON';
                                    } else if (currentDay >= stage.startDay && currentDay <= stage.endDay) {
                                        stageStatus = 'TODAY';
                                    } else if (currentDay > stage.endDay && done < total) {
                                        stageStatus = 'LATE';
                                    }

                                    return (
                                        <WorkflowStageCard
                                            key={stage.stageId}
                                            stage={stage}
                                            tasks={stageTasks}
                                            batchStartDate={batch.startDate}
                                            currentDay={currentDay}
                                            isExpanded={expandedStage === stage.stageId}
                                            onToggle={() =>
                                                setExpandedStage(
                                                    expandedStage === stage.stageId ? null : stage.stageId
                                                )
                                            }
                                            onTaskStatusChange={(taskId, currentStatus) => {
                                                handleToggleTask(taskId, currentStatus);
                                            }}
                                            taskErrors={taskErrors}
                                            stageStatus={stageStatus} // ✅ thêm
                                        />
                                    );
                                })}
                            </div>

                            {/* HIỂN THỊ CÁC TASK KHÔNG THUỘC GIAI ĐOẠN NÀO */}
                            {tasks.filter(task => !stages.some(stage =>
                                task.stageId === stage.stageId ||
                                (!task.stageId && task.plannedDate && getDayNumber(task.plannedDate, batch.startDate) >= stage.startDay && getDayNumber(task.plannedDate, batch.startDate) <= stage.endDay)
                            )).length > 0 && (
                                    <div className="mt-8">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="h-[1px] flex-1 bg-slate-100"></div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhiệm vụ ngoài quy trình</span>
                                            <div className="h-[1px] flex-1 bg-slate-100"></div>
                                        </div>
                                        <div className="space-y-2">
                                            {tasks.filter(task => !stages.some(stage =>
                                                task.stageId === stage.stageId ||
                                                (!task.stageId && task.plannedDate && getDayNumber(task.plannedDate, batch.startDate) >= stage.startDay && getDayNumber(task.plannedDate, batch.startDate) <= stage.endDay)
                                            )).map(task => (
                                                <div key={task.taskId} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-700">{task.title}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">
                                                                📅 {task.plannedDate ? formatDate(task.plannedDate) : "Không xác định"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggleTask(task.taskId, task.status)}
                                                        disabled={user.roleId <= 2}
                                                        className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors
                                                        ${task.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:border-emerald-500'}
                                                        ${user.roleId <= 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {task.status === 'COMPLETED' && <ExclamationCircleIcon className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-3 px-4">
                            {[...BATCH_LOGS].reverse().map(log => (
                                <LogCard key={log.log_id} log={log} />
                            ))}
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {aiAnalyses.length > 0 ? (
                                aiAnalyses.map((analysis) => {
                                    const result = JSON.parse(analysis.resultJson || '{}');
                                    return (
                                        <div key={analysis.analysisId} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="aspect-video relative overflow-hidden bg-slate-100">
                                                <img
                                                    src={analysis.imagePath.startsWith('/') ? `http://localhost:8080${analysis.imagePath}` : analysis.imagePath}
                                                    alt="AI Analysis"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-white text-[10px] font-bold">
                                                    {formatDate(analysis.createdAt)}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${result.disease_class === 'healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {result.disease_class || 'Unknown'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {result.confidence ? (result.confidence * 100).toFixed(1) : 0}% Confidence
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 line-clamp-2 mb-3">
                                                    {result.care_recommendation || 'No recommendation'}
                                                </p>
                                                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-400 font-medium italic">
                                                        #{analysis.analysisId}
                                                    </span>
                                                    <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                                        CHI TIẾT
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <Camera className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-slate-500">Chưa có ảnh phân tích nào</p>
                                    <p className="text-xs text-slate-400 mt-1">Ảnh sẽ xuất hiện ở đây khi công nhân chụp ảnh hoàn thành nhiệm vụ</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {weather &&
                <WeatherModal
                    isOpen={showWeatherModal}
                    onClose={() => setShowWeatherModal(false)}
                    weatherData={weather.weather}
                    batchName={weather.batchName}
                />
            }
        </div>
    );
}