package com.smartfarm.api.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrowthProcessDto {
    private Long processId;
    private Long cropId;
    private String cropName;
    private String processName;
    private Integer totalDays;
}

