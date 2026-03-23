package com.smartfarm.api.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherAlertDto {
    private Integer alertId;
    private Integer pBatchId;
    private String batchName;
    private String alertType;
    private String description;
    private LocalDateTime createdAt;
}
