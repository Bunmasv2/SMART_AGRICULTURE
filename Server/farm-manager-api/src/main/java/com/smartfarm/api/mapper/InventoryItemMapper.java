package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.InventoryItemDto;
import com.smartfarm.api.entity.InventoryItem;
import org.springframework.stereotype.Component;

@Component
public class InventoryItemMapper {
    public InventoryItemDto toDto(InventoryItem entity) {
        if (entity == null) return null;
        return InventoryItemDto.builder()
                .itemId(entity.getItemId())
                .itemName(entity.getItemName())
                .category(entity.getCategory())
                .unit(entity.getUnit())
                .minThreshold(entity.getMinThreshold())
                .build();
    }

    public InventoryItem toEntity(InventoryItemDto dto) {
        if (dto == null) return null;
        return InventoryItem.builder()
                .itemId(dto.getItemId())
                .itemName(dto.getItemName())
                .category(dto.getCategory())
                .unit(dto.getUnit())
                .minThreshold(dto.getMinThreshold())
                .build();
    }
}
