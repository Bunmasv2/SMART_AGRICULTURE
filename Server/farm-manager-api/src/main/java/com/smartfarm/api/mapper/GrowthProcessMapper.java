package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.GrowthProcessDetailDto;
import com.smartfarm.api.dto.GrowthProcessDto;
import com.smartfarm.api.entity.Crop;
import com.smartfarm.api.entity.GrowthProcess;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

@Component
public class GrowthProcessMapper {
    public GrowthProcessDto toDto(GrowthProcess entity) {
        if (entity == null)
            return null;
        GrowthProcessDto dto = GrowthProcessDto.builder()
                .processId(entity.getProcessId())
                .processName(entity.getProcessName())
                .totalDays(entity.getTotalDays())
                .build();
        if (entity.getCrop() != null) {
            dto.setCropId(entity.getCrop().getCropId());
            dto.setCropName(entity.getCrop().getCropName());
            dto.setVariety(entity.getCrop().getVariety());
        }
        return dto;
    }

    public GrowthProcess toEntity(GrowthProcessDto dto) {
        if (dto == null)
            return null;
        GrowthProcess entity = GrowthProcess.builder()
                .processId(dto.getProcessId())
                .processName(dto.getProcessName())
                .totalDays(dto.getTotalDays())
                .build();
        if (dto.getCropId() != null) {
            entity.setCrop(Crop.builder().cropId(dto.getCropId()).build());
        }
        return entity;
    }

    public GrowthProcessDetailDto toDetailDto(GrowthProcess entity) {
        if (entity == null) return null;

        GrowthProcessDetailDto detailDto = GrowthProcessDetailDto.builder()
                .processId(entity.getProcessId())
                .processName(entity.getProcessName())
                .totalDays(entity.getTotalDays())
                .build();

        if (entity.getCrop() != null) {
            detailDto.setCropId(entity.getCrop().getCropId());
            detailDto.setCropName(entity.getCrop().getCropName());
            detailDto.setVariety(entity.getCrop().getVariety());
        }

        if (entity.getStages() != null) {
            detailDto.setStages(entity.getStages().stream()
                    .map(stage -> GrowthProcessDetailDto.StageDto.builder()
                            .stageId(stage.getStageId())
                            .stageName(stage.getStageName())
                            .startDay(stage.getStartDay())
                            .endDay(stage.getEndDay())
                            // --- BỔ SUNG MAPPING TASK TEMPLATES TẠI ĐÂY ---
                            .taskTemplates(stage.getTaskTemplates() != null ? 
                                stage.getTaskTemplates().stream()
                                    .map(tt -> GrowthProcessDetailDto.TaskTemplateDto.builder()
                                            .taskTmpId(tt.getTaskTmpId())
                                            .taskName(tt.getTaskName())
                                            .offsetDay(tt.getOffsetDay())
                                            .quantityRequired(tt.getQuantityRequired())
                                            .build())
                                    .collect(Collectors.toList()) : null)
                            // ----------------------------------------------
                            .build())
                    .collect(Collectors.toList()));
        }

        return detailDto;
    }
}
