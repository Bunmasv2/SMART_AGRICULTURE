import type { StageStatus } from "./Batch";

export interface StageTask {
    day: number;
    task: string;
    done: boolean;
    alert?: boolean; // optional vì không phải task nào cũng có
}

export interface WorkflowStage {
    stage_id: number;
    name: string;
    icon: string; // có thể đổi sang ReactNode nếu dùng UI lib
    color: string;
    day_start: number;
    day_end: number;
    status: StageStatus;
    details: StageTask[];
}