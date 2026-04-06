import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeftIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon as HeroTrash,
} from '@heroicons/react/24/outline';
import {
    LeafIcon,
    ClockIcon,
    LayersIcon,
    ClipboardListIcon,
    BoxIcon
} from 'lucide-react';

import type { StageBase } from '../../models/Stage';
import type { ProcessDetail } from '../../models/GrowthProcess';
import StageModal from '../../components/modals/StageModal';
import TaskTemplateModal from '../../components/modals/TaskTemplateModal';
import type { TaskTemplate } from '../../models/Task';

const STAGE_COLORS = [
    { bg: '#ecfdf5', border: '#10b981', text: '#065f46', dot: '#10b981' },
    { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', dot: '#3b82f6' },
    { bg: '#fdf4ff', border: '#a855f7', text: '#6b21a8', dot: '#a855f7' },
    { bg: '#fff7ed', border: '#f97316', text: '#9a3412', dot: '#f97316' },
    { bg: '#fefce8', border: '#eab308', text: '#713f12', dot: '#eab308' },
];

interface StageTimelineProps {
    stages: StageBase[];
    totalDays: number;
    onEditStage: (s: StageBase) => void;
    onDeleteStage: (id: number) => void;
    onAddTask: (stageId: number) => void;
    onEditTask: (task: TaskTemplate, stageId: number) => void;
    onDeleteTask: (taskId: number) => void;
}

function StageTimeline({
    stages,
    totalDays,
    onEditStage,
    onDeleteStage,
    onAddTask,
    onEditTask,
    onDeleteTask
}: StageTimelineProps) {
    const sorted = [...stages].sort((a, b) => a.startDay - b.startDay);

    if (sorted.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <LayersIcon className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm font-bold uppercase tracking-wider">Chưa có giai đoạn nào</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Progress Bar (Gantt Mini) */}
            <div className="mb-8">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                    <span>Ngày 1</span>
                    <span>Ngày {totalDays}</span>
                </div>
                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    {sorted.map((s, i) => {
                        const left = ((s.startDay - 1) / totalDays) * 100;
                        const width = ((s.endDay - s.startDay + 1) / totalDays) * 100;
                        const col = STAGE_COLORS[i % STAGE_COLORS.length];
                        return (
                            <div
                                key={s.stageId}
                                className="absolute top-0 h-full opacity-80"
                                style={{ left: `${left}%`, width: `${width}%`, backgroundColor: col.dot }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-8 border-l-2 border-slate-100 ml-4 space-y-6">
                {sorted.map((stage, i) => {
                    const col = STAGE_COLORS[i % STAGE_COLORS.length];
                    return (
                        <div key={stage.stageId} className="relative group">
                            {/* Dot */}
                            <div
                                className="absolute -left-[41px] top-4 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10"
                                style={{ backgroundColor: col.dot }}
                            />

                            {/* Stage Card */}
                            <div className="rounded-2xl border p-5 transition-all group-hover:shadow-md"
                                style={{ backgroundColor: col.bg, borderColor: `${col.border}30` }}>

                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: `${col.dot}20`, color: col.text }}>
                                            Giai đoạn {i + 1}: {stage.startDay} → {stage.endDay}
                                        </span>
                                        <h3 className="font-black text-lg mt-1" style={{ color: col.text }}>{stage.stageName}</h3>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* @ts-ignore */}
                                        {JSON.parse(localStorage.getItem('user') || '{}').roleId !== 3 && (
                                            <>
                                                <button onClick={() => onEditStage(stage)} className="p-1.5 hover:bg-white/50 rounded-lg"><PencilIcon className="h-4 w-4 text-slate-500" /></button>
                                                <button onClick={() => onDeleteStage(stage.stageId)} className="p-1.5 hover:bg-red-50 rounded-lg"><HeroTrash className="h-4 w-4 text-red-400" /></button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Task Templates Section */}
                                <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                                            <ClipboardListIcon className="h-3 w-3" /> Công việc mẫu
                                        </h4>
                                        {/* @ts-ignore */}
                                        {JSON.parse(localStorage.getItem('user') || '{}').roleId !== 3 && (
                                            <button
                                                onClick={() => onAddTask(stage.stageId)}
                                                className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-1 rounded-lg border border-emerald-100 shadow-sm hover:bg-emerald-50"
                                            >
                                                + Thêm việc
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        {stage.taskTemplates?.map((tt: TaskTemplate) => (
                                            <div key={tt.taskTmpId} className="flex items-center justify-between bg-white/60 p-3 rounded-xl border border-white group/item hover:border-emerald-200 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-[11px] font-black text-emerald-700">
                                                        +{tt.offsetDay}d
                                                    </div>
                                                    <div>
                                                        <p className="text-[12px] font-bold text-slate-700 leading-none">{tt.taskName}</p>
                                                        {tt.itemName && (
                                                            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                                <BoxIcon className="h-3 w-3" /> {tt.quantityRequired} {tt.itemName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover/item:opacity-100">
                                                    {/* @ts-ignore */}
                                                    {JSON.parse(localStorage.getItem('user') || '{}').roleId !== 3 && (
                                                        <>
                                                            <button onClick={() => onEditTask(tt, stage.stageId)} className="p-1 text-slate-400 hover:text-emerald-600"><PencilIcon className="h-3 w-3" /></button>
                                                            <button onClick={() => onDeleteTask(tt.taskTmpId ?? 1)} className="p-1 text-slate-400 hover:text-red-500"><HeroTrash className="h-3 w-3" /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function GrowthProcessDetail() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [process, setProcess] = useState<ProcessDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [stageModalOpen, setStageModalOpen] = useState(false);
    const [taskModalOpen, setTaskModalOpen] = useState(false);

    // Selection States
    const [editStage, setEditStage] = useState<StageBase | null>(null);
    const [editTask, setEditTask] = useState<TaskTemplate | null>(null);
    const [selectedStageId, setSelectedStageId] = useState<number | null>(null);

    const fetchDetail = useCallback(async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/growth-processes/detail/${id}`);
            console.log(res.data.data)
            setProcess(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    // Handlers cho Stage
    const handleDeleteStage = async (stageId: number) => {
        if (!window.confirm('Xóa giai đoạn sẽ xóa tất cả công việc liên quan?')) return;
        try {
            await axios.delete(`http://localhost:8080/api/stages/${stageId}`);
            fetchDetail();
        } catch (err) { console.error(err); }
    };

    // Handlers cho Task Template
    const handleDeleteTask = async (taskId: number) => {
        if (!window.confirm('Xóa công việc mẫu này?')) return;
        try {
            await axios.delete(`http://localhost:8080/api/task-templates/${taskId}`);
            fetchDetail();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="flex items-center justify-center h-screen animate-pulse text-slate-400 font-black">ĐANG TẢI...</div>;
    if (!process) return <div>Không tìm thấy quy trình</div>;

    return (
        <div className="flex flex-col h-screen bg-slate-50/50">
            {/* Top Bar */}
            <div className="flex-none px-6 py-4 border-b bg-white flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/processes')} className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100">
                        <ArrowLeftIcon className="h-4 w-4 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight">{process.processName}</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Mã quy trình: #{process.processId}</p>
                    </div>
                </div>
                {user.roleId !== 3 && (
                    <button
                        onClick={() => { setEditStage(null); setStageModalOpen(true); }}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-tighter flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                    >
                        <PlusIcon className="h-4 w-4 stroke-[3px]" /> Thêm giai đoạn
                    </button>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header Info Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
                            <LeafIcon className="h-5 w-5 text-emerald-500 mb-2" />
                            <p className="text-[10px] font-black text-slate-400 uppercase">Loại cây</p>
                            <p className="text-sm font-black text-slate-800">{process.cropName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{process.variety}</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
                            <ClockIcon className="h-5 w-5 text-blue-500 mb-2" />
                            <p className="text-[10px] font-black text-slate-400 uppercase">Chu kỳ</p>
                            <p className="text-sm font-black text-slate-800">{process.totalDays} ngày</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
                            <LayersIcon className="h-5 w-5 text-violet-500 mb-2" />
                            <p className="text-[10px] font-black text-slate-400 uppercase">Giai đoạn</p>
                            <p className="text-sm font-black text-slate-800">{process.stages.length} Stages</p>
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                        <StageTimeline
                            stages={process.stages}
                            totalDays={process.totalDays}
                            onEditStage={(s) => { setEditStage(s); setStageModalOpen(true); }}
                            onDeleteStage={handleDeleteStage}
                            onAddTask={(stageId) => { setSelectedStageId(stageId); setEditTask(null); setTaskModalOpen(true); }}
                            onEditTask={(task, stageId) => { setSelectedStageId(stageId); setEditTask(task); setTaskModalOpen(true); }}
                            onDeleteTask={handleDeleteTask}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <StageModal
                isOpen={stageModalOpen}
                onClose={() => setStageModalOpen(false)}
                onSave={fetchDetail}
                processId={process.processId}
                totalDays={process.totalDays}
                editStage={editStage}
            />

            <TaskTemplateModal
                isOpen={taskModalOpen}
                onClose={() => setTaskModalOpen(false)}
                onSave={fetchDetail}
                stageId={selectedStageId}
                editTask={editTask}
            />
        </div>
    );
}