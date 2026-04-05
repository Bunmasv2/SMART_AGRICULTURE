package com.smartfarm.api.dto;

import lombok.Data;

@Data
public class CreateFertilizerRequest {
    private Integer itemId;
    private String name;
    private String unit;
    private String supplier;
    private Double quantity;
    private String receivedDate;
    private String productionDate;
    private String expiryDate;
    private String category; // Fertilizer | Pesticide
}
