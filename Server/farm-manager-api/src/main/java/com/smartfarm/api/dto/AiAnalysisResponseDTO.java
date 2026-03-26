package com.smartfarm.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisResponseDTO {

    // Class bệnh được phát hiện
    private String diseaseClass;

    // Độ tin cậy của kết quả phân tích (0-1)
    private Double confidence;

    // Tình trạng đất (được suy luận từ bệnh lá)
    private String soilCondition;

    // Gợi ý chăm sóc dựa trên kết quả phân tích
    private String careRecommendation;
}
