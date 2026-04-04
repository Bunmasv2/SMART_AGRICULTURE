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
    private String thumbnailPath;
    private String resultJson;
    private LocalDateTime createdAt;

    // Workflow status: PENDING / PROCESSING / COMPLETED / FAILED
    private String workflowStatus;

    // Parsed analysis summary fields
    private String diseaseClass;
    private Double confidence;
    private String soilCondition;
    private String careRecommendation;

    // Notes and workflow metadata
    private String uploadedBy;
    private String workerNote;
    private String adminNote;
    private Boolean finalResult;
    private LocalDateTime analyzedAt;
    private String errorMessage;
}
