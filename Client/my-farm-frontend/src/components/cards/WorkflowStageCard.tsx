import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import type { WorkflowStage } from '../../models/Task';

type WorkflowStageProps = {
    stage: WorkflowStage,
    currentDay: number,
    isExpanded: boolean,
    onToggle: () => void
}

export default function WorkflowStageCard({
    stage, currentDay, isExpanded, onToggle
}: WorkflowStageProps) {
    const isActive = stage.status === "IN_PROGRESS";
    const isDone = stage.status === "COMPLETED";
    const isUpcoming = stage.status === "UPCOMING";
    const completedTasks = stage.details.filter(t => t.done).length;

    return (
        <div
            className={`rounded-2xl border-2 transition-all cursor-pointer overflow-hidden
                ${isActive ? 'border-amber-300 shadow-lg shadow-amber-50' : isDone ? 'border-emerald-200' : 'border-slate-100'}
                ${isExpanded ? 'shadow-xl' : 'hover:shadow-md'}
            `}
            style={{ backgroundColor: isActive ? '#fffbeb' : isDone ? '#f0fdf4' : '#fafafa' }}
            onClick={onToggle}
        >
            <div className="p-4 flex items-center gap-3">
                <div className="text-2xl">{stage.icon}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm">{stage.name}</span>

                        {isActive && (
                            <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full animate-pulse uppercase">
                                Đang thực hiện
                            </span>
                        )}

                        {isDone && (
                            <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase">
                                Hoàn thành
                            </span>
                        )}

                        {isUpcoming && (
                            <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase">
                                Sắp tới
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                        Ngày {stage.day_start}–{stage.day_end} • {completedTasks}/{stage.details.length} nhiệm vụ
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                        <svg width="36" height="36" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r="12" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                            <circle cx="16" cy="16" r="12" fill="none"
                                stroke={stage.color} strokeWidth="3"
                                strokeDasharray={`${2 * Math.PI * 12}`}
                                strokeDashoffset={`${2 * Math.PI * 12 * (1 - completedTasks / stage.details.length)}`}
                                strokeLinecap="round"
                                transform="rotate(-90 16 16)"
                                className="transition-all duration-700"
                            />
                        </svg>
                        <span className="absolute text-[9px] font-bold" style={{ color: stage.color }}>
                            {Math.round((completedTasks / stage.details.length) * 100)}%
                        </span>
                    </div>
                    <span className={`text-slate-400 text-xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3 space-y-2" style={{ borderColor: `${stage.color}20` }}>
                    {stage.details.map((task) => {
                        const isTaskToday = task.day === currentDay;
                        const isOverdue = !task.done && task.day < currentDay;
                        const isFuture = task.day > currentDay;

                        return (
                            <div key={task.day}
                                className={`flex items-start gap-3 p-3 rounded-xl transition-all relative
                                    ${isTaskToday ? 'bg-white ring-2 ring-blue-400 shadow-sm' :
                                        task.alert ? 'bg-red-50 border border-red-200' :
                                            isFuture ? 'opacity-50 bg-slate-50' : 'bg-white/70'}
                                `}
                            >
                                {isTaskToday && (
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-full" />
                                )}

                                <div className="mt-0.5 flex-shrink-0">
                                    {task.done ? (
                                        <CheckCircleSolid className="h-5 w-5 text-emerald-500" />
                                    ) : isOverdue ? (
                                        <ClockIcon className="h-5 w-5 text-red-500 animate-bounce" />
                                    ) : task.alert ? (
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <div className="h-5 w-5 rounded-full border-2 border-slate-300 bg-white" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <span className={`text-xs leading-relaxed font-medium 
                                            ${task.done ? 'text-slate-400 line-through' :
                                                isOverdue ? 'text-red-700 font-bold' :
                                                    task.alert ? 'text-red-700' : 'text-slate-700'}`}>
                                            {task.task}
                                        </span>
                                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 ml-2">
                                            N{task.day}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        {isTaskToday && <span className="text-[9px] font-bold text-blue-600 uppercase">Hôm nay</span>}
                                        {isOverdue && <span className="text-[9px] font-bold text-red-600 uppercase">Trễ hạn</span>}
                                        {isFuture && <span className="text-[9px] font-bold text-slate-400 uppercase">Dự kiến</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}