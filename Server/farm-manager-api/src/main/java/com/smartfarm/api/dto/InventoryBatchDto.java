package com.smartfarm.api.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryBatchDto {
    private Integer batchInvId;
    private Integer itemId;
    private String itemName;
    private String supplier;
    private Double quantity;
    private LocalDate expiryDate;
    private LocalDateTime receivedDate;
    private LocalDate productionDate;
    private Double germinationRate;
    private Double minThreshold;
    private Integer cropId;
    private String cropName;
}
