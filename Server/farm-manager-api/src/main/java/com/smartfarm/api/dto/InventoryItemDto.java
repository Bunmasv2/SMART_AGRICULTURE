package com.smartfarm.api.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDto {
    private Long itemId;
    private String itemName;
    private String category;
    private String unit;
    private Double minThreshold;
    private Long cropId;
    private String cropName;
}
