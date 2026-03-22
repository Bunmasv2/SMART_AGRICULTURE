package com.smartfarm.api.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Integer taskId;
    private Integer pBatchId;
    private String batchName;
    private Integer taskTmpId;
    private String taskTemplateName;
    private String title;
    private LocalDate plannedDate;
    private LocalDate actualDate;
    private Integer assignedToId;
    private String assignedToName;
    private String status;
    private String notes;
}
