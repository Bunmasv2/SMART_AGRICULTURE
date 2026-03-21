package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.GrowthProcessDto;
import com.smartfarm.api.entity.Crop;
import com.smartfarm.api.entity.GrowthProcess;
import org.springframework.stereotype.Component;

@Component
public class GrowthProcessMapper {
    public GrowthProcessDto toDto(GrowthProcess entity) {
        if (entity == null) return null;
        GrowthProcessDto dto = GrowthProcessDto.builder()
                .processId(entity.getProcessId())
                .processName(entity.getProcessName())
                .totalDays(entity.getTotalDays())
                .build();
        if (entity.getCrop() != null) {
            dto.setCropId(entity.getCrop().getCropId());
            dto.setCropName(entity.getCrop().getCropName());
        }
        return dto;
    }

    public GrowthProcess toEntity(GrowthProcessDto dto) {
        if (dto == null) return null;
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
}
