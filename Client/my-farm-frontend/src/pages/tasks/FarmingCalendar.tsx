import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    CalendarDaysIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FunnelIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const API_BASE = 'http://localhost:8080/api';

interface TaskDto {
    taskId: number;
    pBatchId: number;
    batchName: string;
    stageName?: string;
    title: string;
    plannedDate: string; // "YYYY-MM-DD"
    actualDate?: string;
    status: string;
}

interface PlantingBatchDto {
    pBatchId: number;
    batchName: string;
}

export default function FarmingCalendar() {
    const [tasks, setTasks] = useState<TaskDto[]>([]);
    const [batches, setBatches] = useState<PlantingBatchDto[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<number | 'ALL'>('ALL');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(true);

    const [selectedTaskToComplete, setSelectedTaskToComplete] = useState<TaskDto | null>(null);

    const todayStr = new Date().toLocaleString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).split(',')[0];

    const handleTaskClick = (task: TaskDto) => {
        if (task.status === 'PENDING') {
            setSelectedTaskToComplete(task);
        }
    };

    const handleConfirmComplete = async () => {
        if (!selectedTaskToComplete) return;
        try {
            await axios.put(`${API_BASE}/tasks/${selectedTaskToComplete.taskId}/complete`);
            setSelectedTaskToComplete(null);
            fetchData(); // reload tasks
        } catch (error: any) {
            console.error("Lỗi khi hoàn thành task", error);
            const errorMsg = error.response?.data?.message || "Đã xảy ra lỗi khi hoàn thành công việc!";
            alert(errorMsg);
            setSelectedTaskToComplete(null);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tRes, bRes] = await Promise.all([
                axios.get(`${API_BASE}/tasks`),
                axios.get(`${API_BASE}/planting-batches?status=ACTIVE`)
            ]);
            setTasks(tRes.data?.data || []);
            setBatches(bRes.data?.data || []);
        } catch (error) {
            console.error("Lỗi tải dữ liệu Calendar", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Calendar logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Tổng số ngày trong tháng hiện tại
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Vị trí ngày đầu tiên của tháng trong tuần: 0(Sunday) - 6(Saturday)
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Filter tasks by batch dropdown
    const filteredTasks = tasks.filter(t => selectedBatch === 'ALL' || t.pBatchId === selectedBatch);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const isToday = (dateStr: string) => dateStr === todayStr;

    return (
        <div className="flex flex-col h-screen bg-[#f8faf7] overflow-hidden w-full">
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <CalendarDaysIcon className="h-8 w-8 text-blue-500 stroke-[2.5px]" />
                        Lịch Canh Tác
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 ml-11">
                        Tổng quan kế hoạch quản lý nhiệm vụ các lô trồng
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-inner">
                        <FunnelIcon className="h-5 w-5 text-slate-400 stroke-[2px]" />
                        <select
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer pr-4"
                            value={selectedBatch}
                            onChange={e => setSelectedBatch(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                        >
                            <option value="ALL">Tất cả Lô Canh Tác</option>
                            {batches.map(b => (
                                <option key={b.pBatchId} value={b.pBatchId}>Lô {b.batchName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Calendar Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">

                        {/* Calendar Controls */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">
                                THÁNG {month + 1} - {year}
                            </h2>
                            <div className="flex items-center gap-3">
                                <button onClick={prevMonth} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all active:scale-95 shadow-sm">
                                    <ChevronLeftIcon className="h-5 w-5 stroke-[2.5px]" />
                                </button>
                                <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-black text-[11px] uppercase tracking-widest rounded-xl transition-colors active:scale-95">
                                    Hôm nay
                                </button>
                                <button onClick={nextMonth} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all active:scale-95 shadow-sm">
                                    <ChevronRightIcon className="h-5 w-5 stroke-[2.5px]" />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid Header */}
                        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80">
                            {['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'].map(day => (
                                <div key={day} className="py-4 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-100 last:border-0">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid Body */}
                        <div className="grid grid-cols-7 bg-slate-100 gap-[1px] pb-[1px]">
                            {/* Blank padding days for previous month offset */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="bg-white/50 min-h-[160px] opacity-30"></div>
                            ))}

                            {/* Actual days in current month */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const dateNum = i + 1;
                                const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
                                const dayTasks = filteredTasks.filter(t => t.plannedDate === cellDateStr);

                                const isCurrentToday = isToday(cellDateStr);
                                const cellBgClass = isCurrentToday ? 'bg-blue-50/30' : 'bg-white';
                                const todayNumberClass = isCurrentToday
                                    ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg shadow-blue-200 ring-4 ring-blue-100'
                                    : 'text-slate-700 pl-1 pt-1';

                                return (
                                    <div key={dateNum} className={`${cellBgClass} min-h-[160px] p-2.5 hover:bg-slate-50 transition-colors group relative border-b border-transparent`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-sm font-black ${todayNumberClass}`}>
                                                {dateNum}
                                            </span>
                                            {dayTasks.length > 0 && (
                                                <span className="text-[10px] font-bold text-slate-300 group-hover:text-slate-400 bg-slate-50 px-2 rounded-full border border-slate-100">
                                                    {dayTasks.length} việc
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 overflow-y-auto max-h-[110px] pr-1 styled-scrollbars">
                                            {dayTasks.map(task => {
                                                const isCompleted = task.status === 'COMPLETED';
                                                const isOverdue = !isCompleted && task.plannedDate < todayStr;

                                                let badgeColors = "bg-[#f4f7fa] text-blue-700 border-blue-100 hover:bg-blue-50 shadow-sm"; // pending
                                                if (isCompleted) badgeColors = "bg-[#f2fdf6] text-emerald-700 border-emerald-100 hover:bg-emerald-50 shadow-sm"; // completed
                                                else if (isOverdue) badgeColors = "bg-[#fff5f5] text-rose-700 border-rose-100 hover:bg-rose-50 shadow-sm"; // overdue

                                                return (
                                                    <div
                                                        key={task.taskId}
                                                        onClick={() => handleTaskClick(task)}
                                                        title={`${task.title} - Lô: ${task.batchName}`}
                                                        className={`text-[10px] md:text-[11px] font-semibold px-2.5 py-2 rounded-[0.5rem] border ${badgeColors} cursor-pointer transition-all leading-tight flex flex-col gap-1`}
                                                    >
                                                        <div className="flex items-start gap-1.5">
                                                            {isCompleted ? (
                                                                <CheckCircleIcon className="h-3.5 w-3.5 shrink-0 text-emerald-500 stroke-[2.5px] mt-[1px]" />
                                                            ) : isOverdue ? (
                                                                <div className="h-2 w-2 shrink-0 rounded-full bg-rose-500 mt-[5px]"></div>
                                                            ) : (
                                                                <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500 mt-[5px]"></div>
                                                            )}
                                                            <span className="truncate flex-1 tracking-tight">{task.title}</span>
                                                        </div>
                                                        <span className="text-[9px] opacity-70 font-black truncate capitalize ml-5 tracking-widest flex items-center gap-1">
                                                            Lô: {task.batchName}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Blank padding days to complete the last row of grid */}
                            {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
                                <div key={`empty-end-${i}`} className="bg-white/50 min-h-[160px] opacity-30 border-t border-slate-100"></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Xác nhận Hoàn thành */}
            {selectedTaskToComplete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative transform scale-100 opacity-100 transition-all">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
                            <CheckCircleIcon className="h-8 w-8 text-emerald-600 stroke-[2px]" />
                        </div>
                        <h3 className="text-center text-xl font-black text-slate-800 mb-2">Xác nhận hoàn thành?</h3>
                        <p className="text-center text-sm font-medium text-slate-500 mb-6">
                            Bạn đánh dấu xong công việc <strong className="text-slate-700">"{selectedTaskToComplete.title}"</strong> của Lô {selectedTaskToComplete.batchName}.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button 
                                onClick={() => setSelectedTaskToComplete(null)}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all active:scale-95"
                            >
                                Đóng
                            </button>
                            <button 
                                onClick={handleConfirmComplete}
                                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 border border-emerald-600"
                            >
                                Xác nhận {'>'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Thêm chút CSS nhẹ để cuộn mượt cho Calendar */}
            <style>{`
                .styled-scrollbars::-webkit-scrollbar {
                    width: 4px;
                }
                .styled-scrollbars::-webkit-scrollbar-track {
                    background: transparent; 
                }
                .styled-scrollbars::-webkit-scrollbar-thumb {
                    background: #e2e8f0; 
                    border-radius: 4px;
                }
                .styled-scrollbars::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1; 
                }
            `}</style>
        </div>
    );
}
