
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
}

export interface TaskTemplate {
    taskTmpId?: number;        // ID tự tăng (optional khi tạo mới)
    stageId: number;           // Để map với Stage
    taskName: string;          // Tên công việc (VD: Bón phân lần 1)
    
    // Liên quan đến vật tư (InventoryItem)
    itemId?: number | null;    // ID vật tư (có thể không dùng vật tư)
    itemName?: string;         // Tên vật tư (trả về từ DTO để hiển thị)
    quantityRequired?: number; // Số lượng vật tư cần
    unit?: string;             // Đơn vị tính (kg, lít, túi...)
    
    // Logic thời gian
    offsetDay: number;         // Ngày thực hiện kể từ ngày bắt đầu Stage (0 là ngày đầu tiên của Stage)
}

// Dùng cho việc gửi dữ liệu lên API (Request Body)
export interface TaskTemplateRequest {
    taskName: string;
    stageId: number;
    offsetDay: number;
    itemId?: number | null;
    quantityRequired?: number;
}

export interface TaskDto {
    stageId: number
    taskId: number;
    pBatchId: number;
    taskTmpId: number;
    title: string;
    plannedDate: string;
    actualDate?: string;
    assignedToName?: string;
    status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
    notes?: string;
}