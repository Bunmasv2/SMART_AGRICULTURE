package com.smartfarm.api.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisDto {
    private Integer analysisId;
    private Integer pBatchId;
    private String batchName;
    private String imagePath;
    private String resultJson;
    private LocalDateTime createdAt;
}
