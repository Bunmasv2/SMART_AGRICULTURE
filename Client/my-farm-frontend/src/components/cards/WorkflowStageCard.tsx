import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import type { TaskDto, WorkflowStage } from '../../models/Task';
import { STAGE_CONFIG } from '../../utils/IconUtils';
import { getTaskStartDate } from '../../utils/DataUitls';

type WorkflowStageProps = {
    stage: WorkflowStage;
    tasks: TaskDto[];
    batchStartDate: string;
    currentDay: number;
    isExpanded: boolean;
    onToggle: () => void;
    onTaskStatusChange: (taskId: number, currentStatus: string) => void;
    taskErrors: Record<number, string>;
    stageStatus: string;
};

export default function WorkflowStageCard({
    stage,
    tasks,
    batchStartDate,
    currentDay,
    isExpanded,
    onToggle,
    onTaskStatusChange,
    taskErrors,
    stageStatus
}: WorkflowStageProps) {

    const icon = STAGE_CONFIG[stage.stageId]?.icon || "📌";

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 🎨 STYLE STAGE
    const containerStyle =
        stageStatus === 'DONE'
            ? 'border-emerald-200 bg-emerald-50/20'
            : stageStatus === 'LATE'
                ? 'border-red-200 bg-red-50/20'
                : stageStatus === 'TODAY'
                    ? 'border-blue-300 bg-blue-50/30 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300';

    // ✅ normalize date (xoá giờ)
    const normalizeDate = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const today = normalizeDate(new Date());

    return (
        <div className={`bg-white rounded-xl border transition-all overflow-hidden ${containerStyle}`}>
            {/* HEADER */}
            <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={onToggle}>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-lg border shrink-0
                    ${stageStatus === 'DONE' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                        stageStatus === 'TODAY' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                            stageStatus === 'LATE' ? 'bg-red-50 border-red-100 text-red-600' :
                                'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    {icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">
                            {stage.stageName}
                        </span>

                        {/* STATUS */}
                        {stageStatus === 'TODAY' && (
                            <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                ĐANG DIỄN RA
                            </span>
                        )}
                        {stageStatus === 'SOON' && (
                            <span className="text-[9px] font-bold bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded">
                                SẮP TỚI
                            </span>
                        )}
                        {stageStatus === 'LATE' && (
                            <span className="text-[9px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                TRỄ
                            </span>
                        )}
                        {stageStatus === 'DONE' && (
                            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded">
                                HOÀN THÀNH
                            </span>
                        )}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1">
                        Ngày {stage.startDay} – {stage.endDay} • {completedTasks}/{totalTasks} task
                    </div>
                </div>

                <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </span>
            </div>

            {/* TASK LIST */}
            {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/30 divide-y divide-slate-100">
                    {tasks.length > 0 ? tasks.map((task) => {

                        const isTaskDone = task.status === 'COMPLETED';

                        // ✅ Dùng plannedDate từ API, không tính lại
                        const taskDate = task.plannedDate
                            ? normalizeDate(new Date(task.plannedDate + 'T00:00:00'))
                            : null;

                        const isToday = taskDate?.getTime() === today.getTime();
                        const isFuture = taskDate ? taskDate > today : false;
                        const isOverdue = !isTaskDone && taskDate ? taskDate < today : false;

                        return (
                            <div
                                key={task.taskId}
                                className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors
                        ${taskErrors?.[task.taskId]
                                        ? 'bg-red-50 border-l-2 border-red-400'
                                        : 'hover:bg-slate-50'}
                    `}
                            >
                                {/* CHECK */}
                                <button
                                    onClick={() => onTaskStatusChange(task.taskId, task.status)}
                                    className="flex-shrink-0"
                                    disabled={JSON.parse(localStorage.getItem('user') || '{}').roleId <= 2}
                                >
                                    {isTaskDone ? (
                                        <CheckCircleSolid className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <div className={`h-4 w-4 rounded-full border ${isOverdue ? 'border-red-400 bg-red-50' : 'border-slate-300'
                                            } ${JSON.parse(localStorage.getItem('user') || '{}').roleId <= 2 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                                    )}
                                </button>

                                {/* INLINE CONTENT */}
                                <div className="flex-1 flex items-center gap-2 min-w-0">

                                    {/* TITLE */}
                                    <span className={`truncate font-medium ${isTaskDone ? 'line-through text-slate-400' : 'text-slate-700'
                                        }`}>
                                        {task.title}
                                    </span>

                                    {/* DATE */}
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                        {taskDate?.toLocaleDateString('vi-VN') ?? '—'}
                                    </span>

                                    {/* TAG */}
                                    {isToday && (
                                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1 rounded">
                                            TODAY
                                        </span>
                                    )}
                                    {isFuture && (
                                        <span className="text-[9px] font-bold text-yellow-600 bg-yellow-50 px-1 rounded">
                                            SOON
                                        </span>
                                    )}
                                    {isOverdue && (
                                        <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded">
                                            LATE
                                        </span>
                                    )}

                                    {/* USER */}
                                    {task.assignedToName && (
                                        <span className="text-[10px] text-slate-400 truncate">
                                            👤 {task.assignedToName}
                                        </span>
                                    )}
                                </div>

                                {/* ERROR */}
                                {taskErrors?.[task.taskId] && (
                                    <div className="w-full pl-6 text-[10px] text-red-500 mt-1">
                                        ⚠ {taskErrors[task.taskId]}
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="p-6 text-center text-xs text-slate-400 italic">
                            Không có nhiệm vụ
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}