package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.CropDto;
import com.smartfarm.api.entity.Crop;
import org.springframework.stereotype.Component;

@Component
public class CropMapper {
    public CropDto toDto(Crop entity) {
        if (entity == null) return null;
        return CropDto.builder()
                .cropId(entity.getCropId())
                .cropName(entity.getCropName())
                .variety(entity.getVariety())
                .description(entity.getDescription())
                .build();
    }

    public Crop toEntity(CropDto dto) {
        if (dto == null) return null;
        return Crop.builder()
                .cropId(dto.getCropId())
                .cropName(dto.getCropName())
                .variety(dto.getVariety())
                .description(dto.getDescription())
                .build();
    }
}
