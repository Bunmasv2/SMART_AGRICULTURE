export type BatchStatus = 'ACTIVE' | 'WARNING' | 'HARVESTING' | 'COMPLETED';

export type StageStatus = 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'EXPIRED'

// Log event type
export type LogEventType =
    | 'STATUS_CHANGE'
    | 'TASK_COMPLETED'
    | 'AI_WARNING'
    | 'SENSOR_ALERT';

export interface Batch {
    pBatchId: number;
    processId: number
    batchName: string;
    cropCount: number
    processName: string
    cropName: string;
    variety: string;
    areaM2: number;
    startDate: string;
    status: BatchStatus;
    location: string;
}

export interface BatchLog {
    log_id: number;
    event_type: LogEventType;
    content: string;
    created_at: string;
    created_by: string;
    image_url: string | null;
}