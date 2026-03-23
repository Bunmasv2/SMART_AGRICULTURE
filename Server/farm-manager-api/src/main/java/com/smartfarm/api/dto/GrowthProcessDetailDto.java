package com.smartfarm.api.dto;

import java.util.List;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrowthProcessDetailDto {
    private Long processId;
    private String processName;
    private Integer totalDays;
    
    // Thông tin từ Crop
    private Long cropId;
    private String cropName;
    private String variety;

    // Danh sách các giai đoạn
    private List<StageDto> stages;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StageDto {
        private Long stageId;
        private String stageName;
        private Integer startDay;
        private Integer endDay;
    }
}