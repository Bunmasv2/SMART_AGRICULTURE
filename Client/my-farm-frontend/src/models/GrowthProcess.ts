import type { StageBase } from "./Stage"

export interface GrowthProcessBase {
    processId: number
    cropId: number
    cropName: string
    variety: string
    processName: string
    totalDays: number
    stages: StageBase[]
}

export interface ProcessDetail {
    processId: number;
    processName: string;
    totalDays: number;
    cropId: number;
    cropName: string;
    variety: string;
    stages: StageBase[];
}