import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircleIcon, CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as SolidCheck } from '@heroicons/react/24/solid';

const API_BASE = 'http://localhost:8080/api';

interface TaskDto {
    taskId: number;
    pBatchId: number;
    batchName: string;
    stageId?: number;
    stageName?: string;
    taskTemplateName?: string;
    title: string;
    plannedDate: string; // "YYYY-MM-DD"
    actualDate?: string;
    assignedToName?: string;
    status: string;
    notes?: string;
}

export default function TaskManagement() {
    const [activeTab, setActiveTab] = useState<'workflow' | 'history'>('workflow');
    const [tasks, setTasks] = useState<TaskDto[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/tasks`);
            setTasks(res.data?.data || []);
        } catch (e) {
            console.error("Fetch tasks error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const markAsCompleted = async (id: number) => {
        try {
            await axios.put(`${API_BASE}/tasks/${id}/complete`);
            fetchTasks(); // Reload danh sách sau khi hoàn thành
        } catch (error: any) {
            console.error("Lỗi cập nhật:", error);
            const errorMsg = error.response?.data?.message || "Đã có lỗi xảy ra khi hoàn thành nhiệm vụ!";
            alert(errorMsg);
        }
    };

    // Chuẩn bị Date formatter để lấy YYYY-MM-DD
    const todayStr = new Date().toLocaleString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).split(',')[0];

    // Filter tasks
    // CÔNG VIỆC TRONG NGÀY: Pending và từ hôm nay trở về trước (bao gồm cả quá hạn)
    const pendingTasks = tasks.filter(t => t.status === 'PENDING' && t.plannedDate <= todayStr)
        .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());

    // NHẬT KÝ: Đã hoàn thành trong ngày hôm nay
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED' && t.actualDate === todayStr)
        .sort((a, b) => new Date(b.actualDate!).getTime() - new Date(a.actualDate!).getTime());

    return (
        <div className="flex flex-col h-screen bg-[#f8faf7] overflow-hidden w-full">
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-slate-100 shrink-0">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <CheckCircleIcon className="h-8 w-8 text-emerald-500 stroke-[2.5px]" />
                    Quản lý Công việc
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 ml-11">
                    Theo dõi lịch trình và tác vụ canh tác hôm nay
                </p>
            </div>

            {/* Tabs Navigation (User Requested Layout) */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 flex w-full px-8 gap-8 shrink-0 shadow-sm">
                {[
                    { id: 'workflow', label: 'CÔNG VIỆC TRONG NGÀY', count: pendingTasks.length },
                    { id: 'history', label: 'NHẬT KÝ HÔM NAY', count: completedTasks.length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-5 text-[11px] font-black tracking-widest uppercase transition-all relative
                            ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab.label} {tab.count !== null && `(${tab.count})`}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-emerald-500" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    </div>
                ) : activeTab === 'workflow' ? (
                    <div className="max-w-4xl mx-auto space-y-4 pb-20">
                        {pendingTasks.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100">
                                <SolidCheck className="h-16 w-16 text-emerald-200 mx-auto mb-4" />
                                <h3 className="text-slate-500 font-bold text-lg">Tuyệt vời! Bạn không còn tác vụ nào.</h3>
                                <p className="text-slate-400 font-medium text-sm mt-1">Mọi công việc trong ngày đều đã xong hoặc chưa có việc mới.</p>
                            </div>
                        ) : (
                            pendingTasks.map(task => (
                                <TaskCard
                                    key={task.taskId}
                                    task={task}
                                    onComplete={() => markAsCompleted(task.taskId)}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-4 pb-20">
                        {completedTasks.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100">
                                <CalendarDaysIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-slate-500 font-bold text-lg">Hôm nay chưa có nhật ký nào.</h3>
                                <p className="text-slate-400 font-medium text-sm mt-1">Hoàn thành công việc để nó được hệ thống lưu vào nhật ký.</p>
                            </div>
                        ) : (
                            completedTasks.map(task => (
                                <TaskCard
                                    key={task.taskId}
                                    task={task}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Sub-component TaskCard ────────────────────────────────────────────────────────
function TaskCard({ task, onComplete }: { task: TaskDto, onComplete?: () => void }) {
    const todayStr = new Date().toLocaleString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).split(',')[0];
    const isOverdue = task.status === 'PENDING' && task.plannedDate < todayStr;

    return (
        <div className="bg-white rounded-[1.5rem] p-5 md:p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-start justify-between group hover:shadow-md transition-all gap-4">
            <div className="flex gap-4 items-start">
                <div className={`p-3 md:p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-105
                    ${task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600'
                        : isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                    {task.status === 'COMPLETED' ? <SolidCheck className="h-6 w-6" /> : <CalendarDaysIcon className="h-6 w-6" />}
                </div>
                <div>
                    <h3 className="font-black text-slate-800 text-base md:text-lg mb-1 leading-tight">{task.title}</h3>
                    <p className="text-xs md:text-sm font-medium text-slate-500 flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                            <MapPinIcon className="h-3.5 w-3.5" /> Lô: {task.batchName}
                        </span>
                        {task.stageName && (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                                Giai đoạn: {task.stageName}
                            </span>
                        )}
                    </p>
                    {task.notes && (
                        <p className="text-xs text-slate-400 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                            Ghi chú NV: {task.notes}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 justify-between md:justify-start border-t md:border-none border-slate-50 pt-4 md:pt-0">
                <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shrink-0
                    ${task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700'
                        : isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                    {task.status === 'COMPLETED' ? `XONG NGÀY: ${task.actualDate}` : `HẠN CHÓT: ${task.plannedDate}`}
                </div>

                {task.status === 'PENDING' && (
                    <button
                        onClick={onComplete}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] md:text-[11px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 stroke-[3px]" /> XONG
                    </button>
                )}
            </div>
        </div>
    );
}
