package com.smartfarm.api.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisDto {
    private Long analysisId;       // bigint -> giữ Long
    private Integer pBatchId;
    private String batchName;
    private String imagePath;
    private String resultJson;
    private LocalDateTime createdAt;
}
