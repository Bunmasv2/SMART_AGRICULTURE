
export interface StageTask {
    day: number;
    task: string;
    done: boolean;
    alert?: boolean;
}

export interface WorkflowStage {
    stageId: number;
    stageName: string;
    startDay: number;
    endDay: number;
    // details?: StageTask[];
}