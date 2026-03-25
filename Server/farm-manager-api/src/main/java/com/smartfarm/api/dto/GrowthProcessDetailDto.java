package com.smartfarm.api.dto;

import java.util.List;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrowthProcessDetailDto {
    private Integer processId;
    private String processName;
    private Integer totalDays;
    private Integer cropId;
    private String cropName;
    private String variety;

    private List<StageDto> stages;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StageDto {
        private Integer stageId;
        private String stageName;
        private Integer startDay;
        private Integer endDay;

        // Bổ sung danh sách công việc mẫu của từng giai đoạn
        private List<TaskTemplateDto> taskTemplates;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskTemplateDto {
        private Integer taskTmpId;
        private String taskName;
        private Integer offsetDay;
        private Double quantityRequired;
        private String itemName; // Lấy từ InventoryItem
    }
}