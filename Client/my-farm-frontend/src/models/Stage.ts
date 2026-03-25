import type { TaskTemplate } from "./Task";


export interface StageBase {
    stageId: number;
    processId: number;
    stageName: string;
    startDay: number;
    endDay: number;
    // Bổ sung mảng TaskTemplate
    taskTemplates?: TaskTemplate[]; 
}