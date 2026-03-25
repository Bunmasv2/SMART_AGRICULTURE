package com.smartfarm.api.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrowthProcessDto {
    private Integer processId;
    private Integer cropId;
    private String cropName;
    private String variety;
    private String processName;
    private Integer totalDays;
}
