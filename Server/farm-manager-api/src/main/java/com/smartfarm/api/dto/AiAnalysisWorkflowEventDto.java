package com.smartfarm.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisWorkflowEventDto {
    private String eventType;
    private String message;
    private Integer pBatchId;
    private Integer analysisId;
    private AiAnalysisDto item;
}
