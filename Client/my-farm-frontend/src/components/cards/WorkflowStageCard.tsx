import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import type { TaskDto, WorkflowStage } from '../../models/Task';
import { STAGE_CONFIG } from '../../utils/IconUtils';

type WorkflowStageProps = {
    stage: WorkflowStage;
    tasks: TaskDto[];
    batchStartDate: string;
    currentDay: number;
    isExpanded: boolean;
    onToggle: () => void;
    onTaskStatusChange: (taskId: number, currentStatus: string) => void;
};

export default function WorkflowStageCard({
    stage,
    tasks,
    batchStartDate,
    currentDay,
    isExpanded,
    onToggle,
    onTaskStatusChange
}: WorkflowStageProps) {
    const icon = STAGE_CONFIG[stage.stageId]?.icon || "📌";

    // Tính toán tiến độ dựa trên mảng tasks đã được lọc từ cha truyền xuống
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Trạng thái của Stage
    const isDone = currentDay > stage.endDay;
    const isActive = currentDay >= stage.startDay && currentDay <= stage.endDay;
    const isOverdueStage = !isDone && currentDay > stage.endDay && progress < 100;

    const containerStyle = isDone
        ? 'border-emerald-200 bg-emerald-50/20'
        : isOverdueStage
            ? 'border-red-200 bg-red-50/20'
            : isActive
                ? 'border-blue-300 bg-blue-50/30 shadow-sm'
                : 'border-slate-200 hover:border-slate-300';

    // Hàm tính "Ngày thứ N" cho từng Task để hiển thị (Label N1, N2...)
    const getTaskDayNumber = (plannedDate: string) => {
        const start = new Date(batchStartDate);
        const planned = new Date(plannedDate);
        const diffTime = planned.getTime() - start.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    return (
        <div className={`bg-white rounded-xl border transition-all overflow-hidden ${containerStyle}`}>
            {/* HEADER */}
            <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={onToggle}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl border shrink-0
                    ${isDone ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                    isActive ? 'bg-blue-50 border-blue-100 text-blue-600' :
                    'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    {icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">{stage.stageName}</span>
                        {isActive && <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded uppercase">Đang diễn ra</span>}
                        {isDone && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded uppercase">Hoàn thành</span>}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500">
                        Ngày {stage.startDay} – {stage.endDay} 
                        <span className="mx-2 text-slate-300">|</span>
                        {completedTasks}/{totalTasks} nhiệm vụ
                    </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Tiến độ</div>
                        <div className="text-sm font-black text-slate-700">{progress}%</div>
                    </div>
                    <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                </div>
            </div>

            {/* TASK LIST */}
            {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/30 divide-y divide-slate-100">
                    {tasks.length > 0 ? tasks.map((task) => {
                        const taskDay = getTaskDayNumber(task.plannedDate);
                        const isTaskDone = task.status === 'COMPLETED';
                        const isTaskOverdue = !isTaskDone && taskDay < currentDay;

                        return (
                            <div key={task.taskId} className="flex items-start gap-3 p-4 hover:bg-white transition-colors">
                                <button onClick={() => onTaskStatusChange(task.taskId, task.status)} className="mt-0.5 flex-shrink-0">
                                    {isTaskDone ? (
                                        <CheckCircleSolid className="h-6 w-6 text-emerald-500" />
                                    ) : (
                                        <div className={`h-6 w-6 rounded-full border-2 ${isTaskOverdue ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'}`} />
                                    )}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <span className={`text-xs font-semibold ${isTaskDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {task.title}
                                        </span>
                                        <span className="text-[10px] font-mono font-bold text-slate-400">N{taskDay}</span>
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        {taskDay === currentDay && <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">HÔM NAY</span>}
                                        {isTaskOverdue && <span className="text-[8px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">QUÁ HẠN</span>}
                                        {task.assignedToName && <span className="text-[8px] text-slate-400">👤 {task.assignedToName}</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="p-8 text-center text-xs text-slate-400 italic">Không có nhiệm vụ cho giai đoạn này</div>
                    )}
                </div>
            )}
        </div>
    );
}