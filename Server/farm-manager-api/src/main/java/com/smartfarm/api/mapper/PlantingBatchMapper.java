package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.PlantingBatchDto;
import com.smartfarm.api.entity.Crop;
import com.smartfarm.api.entity.GrowthProcess;
import com.smartfarm.api.entity.PlantingBatch;
import org.springframework.stereotype.Component;

@Component
public class PlantingBatchMapper {
    public PlantingBatchDto toDto(PlantingBatch entity) {
        if (entity == null) return null;
        PlantingBatchDto dto = PlantingBatchDto.builder()
                .pBatchId(entity.getPBatchId())
                .batchName(entity.getBatchName())
                .areaM2(entity.getAreaM2())
                .cropCount(entity.getCropCount())
                .locationCoords(entity.getLocationCoords())
                .startDate(entity.getStartDate())
                .status(entity.getStatus())
                .build();
        if (entity.getCrop() != null) {
            dto.setCropId(entity.getCrop().getCropId());
            dto.setCropName(entity.getCrop().getCropName());
            dto.setVariety(entity.getCrop().getVariety());
        }
        if (entity.getProcess() != null) {
            dto.setProcessId(entity.getProcess().getProcessId());
            dto.setProcessName(entity.getProcess().getProcessName());
        }
        return dto;
    }

    public PlantingBatch toEntity(PlantingBatchDto dto) {
        if (dto == null) return null;
        PlantingBatch entity = PlantingBatch.builder()
                .pBatchId(dto.getPBatchId())
                .batchName(dto.getBatchName())
                .areaM2(dto.getAreaM2())
                .cropCount(dto.getCropCount())
                .locationCoords(dto.getLocationCoords())
                .startDate(dto.getStartDate())
                .status(dto.getStatus())
                .build();
        if (dto.getCropId() != null) {
            entity.setCrop(Crop.builder().cropId(dto.getCropId()).build());
        }
        if (dto.getProcessId() != null) {
            entity.setProcess(GrowthProcess.builder().processId(dto.getProcessId()).build());
        }
        return entity;
    }
}
