import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import type { WorkflowStage } from '../../models/Task';
import { STAGE_ICONS } from '../../utils/IconUtils';

type WorkflowStageProps = {
    stage: WorkflowStage;
    currentDay: number;
    isExpanded: boolean;
    onToggle: () => void;
};

export default function WorkflowStageCard({
    stage,
    currentDay,
    isExpanded,
    onToggle
}: WorkflowStageProps) {

    // ✅ icon theo stageId (fallback nếu thiếu)
    const icon = STAGE_ICONS[stage.stageId] || "📌";

    // ✅ tính status từ currentDay (KHÔNG dùng backend nữa)
    const isDone = currentDay > stage.endDay;
    const isActive = currentDay >= stage.startDay && currentDay <= stage.endDay;
    const isUpcoming = currentDay < stage.startDay;

    // ✅ overdue (stage đã qua nhưng chưa hoàn thành hết task)
    // const totalTasks = stage.details?.length || 0;
    // const completedTasks = stage.details?.filter(t => t.done).length || 0;

    const isOverdueStage = !isDone && stage.endDay < currentDay;

    // ✅ tránh chia 0
    // const progress = totalTasks > 0
    //     ? Math.round((completedTasks / totalTasks) * 100)
    //     : 0;

    const containerStyle = isDone
        ? 'border-emerald-300 bg-emerald-50/30'
        : isOverdueStage
            ? 'border-red-300 bg-red-50/30'
            : isActive
                ? 'border-blue-300 bg-blue-50/30 shadow-sm'
                : 'border-slate-300 hover:border-slate-200';

    return (
        <div
            className={`bg-white rounded-xl border transition-all cursor-pointer overflow-hidden ${containerStyle}`}
            onClick={onToggle}
        >
            <div className="p-5 flex items-center gap-4">
                {/* ICON */}
                <div className={`
                    h-10 w-10 rounded-xl flex items-center justify-center text-xl border shrink-0
                    ${isDone ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                        isOverdueStage ? 'bg-red-50 border-red-100 text-red-600' :
                            isActive ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                'bg-slate-50 border-slate-100 text-slate-500'}
                `}>
                    {icon}
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">
                            {stage.stageName}
                        </span>

                        {isActive && (
                            <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                                Đang thực hiện
                            </span>
                        )}

                        {isDone && (
                            <span className="text-[9px] font-bold text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider bg-emerald-50">
                                Hoàn thành
                            </span>
                        )}

                        {isOverdueStage && (
                            <span className="text-[9px] font-bold text-red-600 px-2 py-0.5 rounded border border-red-100 uppercase tracking-wider bg-red-50">
                                Trễ hạn
                            </span>
                        )}

                        {isUpcoming && (
                            <span className="text-[9px] font-bold text-slate-400 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-wider bg-slate-50">
                                Sắp diễn ra
                            </span>
                        )}
                    </div>

                    <div className="text-[11px] font-medium text-slate-500">
                        Ngày {stage.startDay} – {stage.endDay}
                        <span className="mx-1 text-slate-300">•</span>
                        {/* {completedTasks}/{totalTasks} nhiệm vụ */}
                    </div>
                </div>

                {/* PROGRESS */}
                <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                            Tiến độ
                        </div>
                        <div className="text-sm font-black text-slate-700">
                            {/* {progress}% */}
                        </div>
                    </div>

                    <span className={`text-slate-400 text-xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </span>
                </div>
            </div>

            {/* TASK LIST */}
            {isExpanded && (
                <div className="border-t border-slate-50 bg-slate-50/50">
                    <div className="divide-y divide-slate-100/50">
                        {/* {stage.details?.map((task) => {
                            const isTaskToday = task.day === currentDay;
                            const isOverdue = !task.done && task.day < currentDay;
                            const isFuture = task.day > currentDay;

                            return (
                                <div key={task.day}
                                    className={`flex items-start gap-3 p-4 transition-all
                                        ${isTaskToday ? 'bg-white' : isFuture ? 'opacity-60' : ''}
                                    `}
                                >
                                    <div className="mt-0.5 flex-shrink-0">
                                        {task.done ? (
                                            <CheckCircleSolid className="h-5 w-5 text-emerald-500" />
                                        ) : isOverdue ? (
                                            <ClockIcon className="h-5 w-5 text-red-500" />
                                        ) : task.alert ? (
                                            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                                        ) : (
                                            <div className="h-4 w-4 m-0.5 rounded-full border-2 border-slate-300 bg-white" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <span className={`text-xs font-medium 
                                                ${task.done ? 'text-slate-400 line-through' :
                                                    isOverdue ? 'text-red-600' :
                                                        task.alert ? 'text-amber-700' : 'text-slate-700'}`}>
                                                {task.task}
                                            </span>

                                            <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0 ml-3">
                                                N{task.day}
                                            </span>
                                        </div>

                                        {(isTaskToday || isOverdue || task.alert) && (
                                            <div className="flex gap-2 mt-1.5">
                                                {isTaskToday && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Hôm nay</span>}
                                                {isOverdue && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Trễ hạn</span>}
                                                {task.alert && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Cần chú ý</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })} */}
                    </div>
                </div>
            )}
        </div>
    );
}