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
    private Integer rainProbabilityThreshold;
    private Double highTempThreshold;
    private Double lowTempThreshold;
    private Double strongWindThreshold;
    private Integer highHumidityThreshold;
    private Integer stormWeatherCode;
}
