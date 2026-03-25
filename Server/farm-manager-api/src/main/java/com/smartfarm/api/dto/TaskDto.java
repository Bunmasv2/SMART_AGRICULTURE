package com.smartfarm.api.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long taskId;
    private Long pBatchId;
    private String batchName;
    
    // Thêm thông tin Stage
    private Long stageId;
    private String stageName;
    
    private Long taskTmpId;
    private String taskTemplateName;
    private String title;
    private LocalDate plannedDate;
    private LocalDate actualDate;
    private Long assignedToId;
    private String assignedToName;
    private String status;
    private String notes;
}