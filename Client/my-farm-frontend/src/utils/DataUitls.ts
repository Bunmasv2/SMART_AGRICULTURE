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

export const getDayNumber = (targetDate: string | Date, startDate: string | Date): number => {
    const start = new Date(startDate);
    const target = new Date(targetDate);

    // Reset về 00:00:00 để chỉ tính khoảng cách ngày, không tính giờ
    start.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - start.getTime();
    
    // 1 ngày = 24h * 60p * 60s * 1000ms = 86,400,000 ms
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // +1 vì ngày bắt đầu được tính là Ngày 1
    return diffDays + 1;
};