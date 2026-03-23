import type { WorkflowStage } from "../models/Task";
import type { WeatherInfo, AnalysisHistoryItem } from "../models/AiAnalysis";

export const getDaysSinceStart = (startDate: string): number => {
    const start = new Date(startDate).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
};

export const getCurrentStage = (days: number, stages: WorkflowStage[]): WorkflowStage => {
    return (
        stages.find((s) => days >= s.day_start && days <= s.day_end) ||
        stages[stages.length - 1]
    );
};

export const getTotalDays = (stages: WorkflowStage[]): number => {
    if (!stages.length) return 0;
    return stages[stages.length - 1].day_end;
};

// Mock data for AI Analysis
export const mockWeatherInfo: WeatherInfo = {
    location: "TP. Hồ Chí Minh",
    temperature: 32,
    condition: "Nắng",
    humidity: 65
};

export const mockAnalysisHistory: AnalysisHistoryItem[] = [
    {
        id: "AH001",
        date: "2026-03-23T10:30:00",
        diseaseClass: "Healthy Leaf",
        batchId: "1",
        batchName: "Lô Chanh A1"
    },
    {
        id: "AH002",
        date: "2026-03-22T14:15:00",
        diseaseClass: "Bacterial Blight",
        batchId: "2",
        batchName: "Lô Chanh B2"
    },
    {
        id: "AH003",
        date: "2026-03-21T09:45:00",
        diseaseClass: "Deficiency Leaf",
        batchId: "1",
        batchName: "Lô Chanh A1"
    },
    {
        id: "AH004",
        date: "2026-03-20T16:20:00",
        diseaseClass: "Anthracnose",
        batchId: "3",
        batchName: "Lô Chanh C3"
    },
    {
        id: "AH005",
        date: "2026-03-19T11:00:00",
        diseaseClass: "Healthy Leaf",
        batchId: "4",
        batchName: "Lô Chanh D4"
    }
];