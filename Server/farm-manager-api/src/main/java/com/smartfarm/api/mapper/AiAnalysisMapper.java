package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.AiAnalysisDto;
import com.smartfarm.api.entity.AiAnalysis;
import com.smartfarm.api.entity.PlantingBatch;
import org.springframework.stereotype.Component;

@Component
public class AiAnalysisMapper {
    public AiAnalysisDto toDto(AiAnalysis entity) {
        if (entity == null) return null;
        AiAnalysisDto dto = AiAnalysisDto.builder()
                .analysisId(entity.getAnalysisId())
                .imagePath(entity.getImagePath())
                .resultJson(entity.getResultJson())
                .createdAt(entity.getCreatedAt())
                .build();
        if (entity.getPlantingBatch() != null) {
            dto.setPBatchId(entity.getPlantingBatch().getPBatchId());
            dto.setBatchName(entity.getPlantingBatch().getBatchName());
        }
        return dto;
    }

    public AiAnalysis toEntity(AiAnalysisDto dto) {
        if (dto == null) return null;
        AiAnalysis entity = AiAnalysis.builder()
                .analysisId(dto.getAnalysisId())
                .imagePath(dto.getImagePath())
                .resultJson(dto.getResultJson())
                .createdAt(dto.getCreatedAt())
                .build();
        if (dto.getPBatchId() != null) {
            entity.setPlantingBatch(PlantingBatch.builder().pBatchId(dto.getPBatchId()).build());
        }
        return entity;
    }
}
