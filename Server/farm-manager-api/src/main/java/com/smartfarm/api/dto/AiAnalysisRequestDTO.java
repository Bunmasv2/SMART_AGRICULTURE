package com.smartfarm.api.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisRequestDTO {

    // ID của PlantingBatch cần phân tích
    private Integer pBatchId;

    // File ảnh lá cây chanh cần phân tích
    private MultipartFile imageFile;
}
