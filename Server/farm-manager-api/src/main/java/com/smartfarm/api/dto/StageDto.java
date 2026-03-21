package com.smartfarm.api.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StageDto {
    private Long stageId;
    private Long processId;
    private String processName;
    private String stageName;
    private Integer startDay;
    private Integer endDay;
}
