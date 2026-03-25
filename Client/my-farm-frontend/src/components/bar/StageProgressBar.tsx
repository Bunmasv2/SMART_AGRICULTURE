import type { StageBase } from "../../models/Stage";
import { STAGE_CONFIG } from '../../utils/IconUtils';

type StageProgressProps = {
    stages: StageBase[],
    totalDays: number
    currentDay: number
}

export default function StageProgressBar({ stages, totalDays, currentDay }: StageProgressProps) {
    const progressPercent = Math.min((currentDay / totalDays) * 100, 100);

    return (
        <div className="w-full py-10 px-4">
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-2 bg-slate-200 -translate-y-1/2 rounded-full" />
                <div
                    className="absolute top-1/2 left-0 h-2 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    style={{ width: `${progressPercent}%` }}
                />

                <div className="relative flex justify-between items-center w-full">
                    {stages.map((stage) => {
                        const config = STAGE_CONFIG[stage.stageName] || STAGE_CONFIG['default'];

                        const isDone = currentDay > stage.endDay;
                        const isActive = currentDay >= stage.startDay && currentDay <= stage.endDay;

                        return (
                            <div key={stage.stageId} className="relative flex flex-col items-center">
                                <div
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center z-10 
                                        transition-all duration-500 border-4 bg-white
                                        ${isDone ? 'scale-100' : isActive ? 'scale-125 shadow-xl' : 'scale-90 opacity-60'}
                                    `}
                                    style={{
                                        borderColor: isDone || isActive ? config.color : '#e2e8f0',
                                    }}
                                >
                                    <span className="text-lg">
                                        {config.icon}
                                    </span>

                                    {isActive && (
                                        <div
                                            className="absolute inset-0 rounded-full animate-ping opacity-25"
                                            style={{ backgroundColor: config.color }}
                                        />
                                    )}
                                </div>

                                <div className="absolute -top-8 whitespace-nowrap">
                                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {stage.stageName}
                                    </span>
                                </div>

                                <div className="absolute -bottom-7 flex flex-col items-center">
                                    <span className={`text-[9px] font-mono font-bold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                                        Ngày {stage.startDay}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}