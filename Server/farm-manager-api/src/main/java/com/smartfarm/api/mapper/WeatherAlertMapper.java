package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.WeatherAlertDto;
import com.smartfarm.api.entity.PlantingBatch;
import com.smartfarm.api.entity.WeatherAlert;
import org.springframework.stereotype.Component;

@Component
public class WeatherAlertMapper {
    public WeatherAlertDto toDto(WeatherAlert entity) {
        if (entity == null) return null;
        WeatherAlertDto dto = WeatherAlertDto.builder()
                .alertId(entity.getAlertId())
                .alertType(entity.getAlertType())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .build();
        if (entity.getPlantingBatch() != null) {
            dto.setPBatchId(entity.getPlantingBatch().getPBatchId());
            dto.setBatchName(entity.getPlantingBatch().getBatchName());
        }
        return dto;
    }

    public WeatherAlert toEntity(WeatherAlertDto dto) {
        if (dto == null) return null;
        WeatherAlert entity = WeatherAlert.builder()
                .alertId(dto.getAlertId())
                .alertType(dto.getAlertType())
                .description(dto.getDescription())
                .createdAt(dto.getCreatedAt())
                .build();
        if (dto.getPBatchId() != null) {
            entity.setPlantingBatch(PlantingBatch.builder().pBatchId(dto.getPBatchId()).build());
        }
        return entity;
    }
}
