package com.smartfarm.api.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CropDto {
    private Integer cropId;
    private String cropName;
    private String variety;
    private String description;
}
