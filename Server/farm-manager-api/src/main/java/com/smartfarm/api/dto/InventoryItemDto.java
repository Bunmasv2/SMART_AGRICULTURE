package com.smartfarm.api.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDto {
    private Integer itemId;
    private String itemName;
    private String category;
    private String unit;
    private Double minThreshold;
    private Integer cropId;
    private String cropName;
    private String supplier;
}