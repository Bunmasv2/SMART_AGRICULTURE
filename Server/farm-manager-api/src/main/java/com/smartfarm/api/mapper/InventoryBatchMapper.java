package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.InventoryBatchDto;
import com.smartfarm.api.entity.InventoryBatch;
import com.smartfarm.api.entity.InventoryItem;
import org.springframework.stereotype.Component;

@Component
public class InventoryBatchMapper {
    public InventoryBatchDto toDto(InventoryBatch entity) {
        if (entity == null) return null;
        InventoryBatchDto dto = InventoryBatchDto.builder()
                .batchInvId(entity.getBatchInvId())
                .supplier(entity.getSupplier())
                .quantity(entity.getQuantity())
                .expiryDate(entity.getExpiryDate())
                .receivedDate(entity.getReceivedDate())
                .productionDate(entity.getProductionDate())
                .germinationRate(entity.getGerminationRate())
                .build();
        if (entity.getItem() != null) {
            dto.setItemId(entity.getItem().getItemId());
            dto.setItemName(entity.getItem().getItemName());
            dto.setMinThreshold(entity.getItem().getMinThreshold());
            if (entity.getItem().getCrop() != null) {
                dto.setCropId(entity.getItem().getCrop().getCropId());
                dto.setCropName(entity.getItem().getCrop().getCropName());
            }
        }
        return dto;
    }

    public InventoryBatch toEntity(InventoryBatchDto dto) {
        if (dto == null) return null;
        InventoryBatch entity = InventoryBatch.builder()
                .batchInvId(dto.getBatchInvId())
                .supplier(dto.getSupplier())
                .quantity(dto.getQuantity())
                .expiryDate(dto.getExpiryDate())
                .receivedDate(dto.getReceivedDate())
                .productionDate(dto.getProductionDate())
                .germinationRate(dto.getGerminationRate())
                .build();
        if (dto.getItemId() != null) {
            InventoryItem item = InventoryItem.builder().itemId(dto.getItemId()).build();
            if (dto.getCropId() != null) {
                item.setCrop(com.smartfarm.api.entity.Crop.builder().cropId(dto.getCropId()).build());
            }
            entity.setItem(item);
        }
        return entity;
    }
}
