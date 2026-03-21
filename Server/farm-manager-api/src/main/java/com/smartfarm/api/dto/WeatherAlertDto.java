package com.smartfarm.api.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherAlertDto {
    private Long alertId;
    private Long pBatchId;
    private String batchName;
    private String alertType;
    private String description;
    private LocalDateTime createdAt;
}
