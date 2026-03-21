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
                .build();
        if (entity.getItem() != null) {
            dto.setItemId(entity.getItem().getItemId());
            dto.setItemName(entity.getItem().getItemName());
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
                .build();
        if (dto.getItemId() != null) {
            entity.setItem(InventoryItem.builder().itemId(dto.getItemId()).build());
        }
        return entity;
    }
}
