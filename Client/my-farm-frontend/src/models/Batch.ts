export type BatchStatus = 'ACTIVE' | 'WARNING' | 'HARVESTING' | 'COMPLETED';

export type StageStatus = 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';

// Log event type
export type LogEventType =
    | 'STATUS_CHANGE'
    | 'TASK_COMPLETED'
    | 'AI_WARNING'
    | 'SENSOR_ALERT';

export interface Batch {
    p_batch_id: number;
    batch_name: string;
    crop_name: string;
    variety: string;
    area_m2: number;
    start_date: string; // ISO string (sau này nên convert Date)
    expected_harvest: string;
    status: BatchStatus;
    farmer: string;
    location: string;
    notes?: string;
}

export interface BatchLog {
    log_id: number;
    event_type: LogEventType;
    content: string;
    created_at: string;
    created_by: string;
    image_url: string | null;
}