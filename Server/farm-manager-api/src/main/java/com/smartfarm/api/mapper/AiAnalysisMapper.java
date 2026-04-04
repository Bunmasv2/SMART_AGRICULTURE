package com.smartfarm.api.mapper;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfarm.api.dto.AiAnalysisDto;
import com.smartfarm.api.entity.AiAnalysis;
import com.smartfarm.api.entity.PlantingBatch;
import com.smartfarm.api.enums.AiAnalysisStatus;

@Component
public class AiAnalysisMapper {
    private final ObjectMapper objectMapper;

    public AiAnalysisMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public AiAnalysisDto toDto(AiAnalysis entity) {
        if (entity == null) return null;

        AiAnalysisDto dto = AiAnalysisDto.builder()
                .analysisId(entity.getAnalysisId())
                .imagePath(entity.getImagePath())
                .thumbnailPath(null)
                .resultJson(entity.getResultJson())
                .createdAt(entity.getCreatedAt())
                .build();

        if (entity.getPlantingBatch() != null) {
            dto.setPBatchId(entity.getPlantingBatch().getPBatchId());
            dto.setBatchName(entity.getPlantingBatch().getBatchName());
        }

        applyParsedResultJson(entity.getResultJson(), dto);
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

    private void applyParsedResultJson(String resultJson, AiAnalysisDto dto) {
        if (resultJson == null || resultJson.isBlank()) {
            dto.setWorkflowStatus(AiAnalysisStatus.PENDING.name());
            dto.setThumbnailPath(dto.getImagePath());
            dto.setUploadedBy("Worker");
            dto.setFinalResult(Boolean.FALSE);
            return;
        }

        try {
            JsonNode root = objectMapper.readTree(resultJson);

            dto.setWorkflowStatus(resolveStatus(root));
            dto.setDiseaseClass(textValue(root, "disease_class"));
            dto.setConfidence(numberValue(root, "confidence"));
            dto.setSoilCondition(textValue(root, "soil_condition"));
            dto.setCareRecommendation(textValue(root, "care_recommendation"));
            dto.setThumbnailPath(textValue(root, "thumbnail_path"));
            dto.setUploadedBy(textValue(root, "uploaded_by"));
            dto.setWorkerNote(textValue(root, "worker_note"));
            dto.setAdminNote(textValue(root, "admin_note"));
            dto.setErrorMessage(textValue(root, "error_message"));
            dto.setFinalResult(root.path("is_final_result").asBoolean(false));

            if (dto.getThumbnailPath() == null || dto.getThumbnailPath().isBlank()) {
                dto.setThumbnailPath(dto.getImagePath());
            }

            if (dto.getUploadedBy() == null || dto.getUploadedBy().isBlank()) {
                dto.setUploadedBy("Worker");
            }

            String analyzedAt = textValue(root, "analyzed_at");
            if (analyzedAt != null && !analyzedAt.isBlank()) {
                try {
                    dto.setAnalyzedAt(LocalDateTime.parse(analyzedAt));
                } catch (DateTimeParseException ignored) {
                    dto.setAnalyzedAt(null);
                }
            }
        } catch (IOException ignored) {
            dto.setWorkflowStatus(AiAnalysisStatus.PENDING.name());
            dto.setThumbnailPath(dto.getImagePath());
            dto.setUploadedBy("Worker");
            dto.setFinalResult(Boolean.FALSE);
        }
    }

    private String resolveStatus(JsonNode root) {
        String raw = textValue(root, "workflow_status");
        if (raw != null && !raw.isBlank()) {
            return raw.toUpperCase();
        }

        if (root.hasNonNull("disease_class")) {
            return AiAnalysisStatus.COMPLETED.name();
        }

        return AiAnalysisStatus.PENDING.name();
    }

    private String textValue(JsonNode root, String field) {
        JsonNode node = root.get(field);
        if (node == null || node.isNull()) {
            return null;
        }

        String value = node.asText();
        return value == null || value.isBlank() ? null : value;
    }

    private Double numberValue(JsonNode root, String field) {
        JsonNode node = root.get(field);
        if (node == null || node.isNull()) {
            return null;
        }

        return node.asDouble();
    }
}
