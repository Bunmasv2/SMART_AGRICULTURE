package com.smartfarm.api.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskTemplateDto {
    private Long taskTmpId;
    private Long stageId;
    private String stageName;
    private String taskName;
    private Long itemId;
    private String itemName;
    private Double quantityRequired;
    private Integer offsetDay;
}
