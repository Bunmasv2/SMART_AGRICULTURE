import type { WorkflowStage } from "../models/Task";

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

export const getExpectedDate = (startDateStr: string, totalDays: number) => {
    const date = new Date(startDateStr);
    date.setDate(date.getDate() + totalDays);

    // Định dạng dd/mm/yyyy
    return date.toLocaleDateString('vi-VN');
};

export const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
};