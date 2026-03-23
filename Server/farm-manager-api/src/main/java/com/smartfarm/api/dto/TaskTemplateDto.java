package com.smartfarm.api.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskTemplateDto {
    private Integer taskTmpId;
    private Integer stageId;
    private String stageName;
    private String taskName;
    private Integer itemId;
    private String itemName;
    private Double quantityRequired;
    private Integer offsetDay;
}
