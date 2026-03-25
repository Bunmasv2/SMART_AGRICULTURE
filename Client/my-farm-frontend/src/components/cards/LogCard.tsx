import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import {
    ExclamationTriangleIcon,
    ClockIcon,
    CameraIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import type { BatchLog } from '../../models/Batch';

const EVENT_STYLES = {
    TASK_COMPLETED: { bg: "bg-emerald-50", border: "border-emerald-200", icon: <CheckCircleSolid className="h-4 w-4 text-emerald-500" />, label: "Hoàn thành", labelColor: "text-emerald-700 bg-emerald-100" },
    AI_WARNING: { bg: "bg-amber-50", border: "border-amber-200", icon: <SparklesIcon className="h-4 w-4 text-amber-500" />, label: "AI Cảnh báo", labelColor: "text-amber-700 bg-amber-100" },
    SENSOR_ALERT: { bg: "bg-red-50", border: "border-red-200", icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />, label: "Cảm biến", labelColor: "text-red-700 bg-red-100" },
    STATUS_CHANGE: { bg: "bg-blue-50", border: "border-blue-200", icon: <ClockIcon className="h-4 w-4 text-blue-500" />, label: "Thay đổi", labelColor: "text-blue-700 bg-blue-100" },
};

type LogProps = {
    log: BatchLog
}

export default function LogCard({ log }: LogProps) {
    const style = EVENT_STYLES[log.event_type] || EVENT_STYLES.TASK_COMPLETED;

    return (
        <div className={`flex gap-2 p-3 rounded-xl border ${style.bg} ${style.border}`}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] flex-wrap">
                    
                    {/* Icon + Label */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${style.labelColor}`}>
                        {style.icon}
                        {style.label}
                    </span>

                    <span className="text-slate-400 font-mono">{log.created_at}</span>
                    <span className="text-slate-400">• {log.created_by}</span>

                    {log.image_url && (
                        <span className="ml-auto inline-flex items-center gap-1 text-blue-600 cursor-pointer hover:underline">
                            <CameraIcon className="h-3 w-3" />
                        </span>
                    )}
                </div>

                <p className="text-xs text-slate-700 leading-snug mt-1">
                    {log.content}
                </p>
            </div>
        </div>
    );
}
