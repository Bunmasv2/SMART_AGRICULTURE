package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.InventoryItemDto;
import com.smartfarm.api.entity.InventoryItem;
import com.smartfarm.api.entity.Crop;
import org.springframework.stereotype.Component;

@Component
public class InventoryItemMapper {
    public InventoryItemDto toDto(InventoryItem entity) {
        if (entity == null) return null;
        InventoryItemDto dto = InventoryItemDto.builder()
                .itemId(entity.getItemId())
                .itemName(entity.getItemName())
                .category(entity.getCategory())
                .unit(entity.getUnit())
                .minThreshold(entity.getMinThreshold())
                .build();
        if (entity.getCrop() != null) {
            dto.setCropId(entity.getCrop().getCropId());
            dto.setCropName(entity.getCrop().getCropName());
        }
        return dto;
    }

    public InventoryItem toEntity(InventoryItemDto dto) {
        if (dto == null) return null;
        InventoryItem entity = InventoryItem.builder()
                .itemId(dto.getItemId())
                .itemName(dto.getItemName())
                .category(dto.getCategory())
                .unit(dto.getUnit())
                .minThreshold(dto.getMinThreshold())
                .build();
        if (dto.getCropId() != null) {
            entity.setCrop(Crop.builder().cropId(dto.getCropId()).build());
        }
        return entity;
    }
}
