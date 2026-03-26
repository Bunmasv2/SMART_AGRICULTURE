package com.smartfarm.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskProgressDTO {

    // Tổng số task
    private Integer totalTasks;

    // Số task đã hoàn thành
    private Integer completedTasks;

    // Phần trăm hoàn thành (%)
    private Double completionPercentage;
}
