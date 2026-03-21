package com.smartfarm.api.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CropDto {
    private Long cropId;
    private String cropName;
    private String variety;
    private String description;
}
