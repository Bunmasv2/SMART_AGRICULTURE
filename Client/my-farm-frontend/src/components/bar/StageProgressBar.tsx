import type { WorkflowStage } from "../../models/Task";

type StageProgressProps = {
    stages: WorkflowStage[],
    currentDay: number
}

export default function StageProgressBar({ stages, currentDay }: StageProgressProps) {
    const totalDays = stages[stages.length - 1].day_end;
    const progressPercent = Math.min((currentDay / totalDays) * 100, 100);

    return (
        <div className="w-full py-6 px-2">
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-3 bg-slate-200 -translate-y-1/2 rounded-full shadow-inner" />

                <div 
                    className="absolute top-1/2 left-0 h-3 bg-emerald-500 -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />

                <div className="relative flex justify-between items-center w-full">
                    {stages.map((stage) => {
                        const isDone = stage.status === "COMPLETED";
                        const isActive = stage.status === "IN_PROGRESS";
                        
                        return (
                            <div key={stage.stage_id} className="relative flex flex-col items-center">
                                <div 
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500 border-4
                                        ${isDone ? 'bg-white' : isActive ? 'bg-white scale-125 shadow-lg' : 'bg-slate-100'}
                                    `}
                                    style={{ 
                                        borderColor: isDone || isActive ? stage.color : '#e2e8f0',
                                    }}
                                >
                                    <span className={`text-sm ${!isDone && !isActive ? 'grayscale opacity-40' : ''}`}>
                                        {stage.icon}
                                    </span>
                                    
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: stage.color }} />
                                    )}
                                </div>

                                <div className="absolute -bottom-6 flex flex-col items-center whitespace-nowrap">
                                    <span className={`text-[8px] font-black font-mono ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                                        N{stage.day_start}
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