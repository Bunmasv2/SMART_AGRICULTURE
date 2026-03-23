package com.smartfarm.api.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StageSimpleDto {
    private Long stageId;
    private String stageName;
    private Integer startDay;
    private Integer endDay;
}