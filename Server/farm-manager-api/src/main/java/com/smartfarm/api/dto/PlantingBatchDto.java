package com.smartfarm.api.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlantingBatchDto {
    private Integer pBatchId;
    private String batchName;
    private Integer cropId;
    private String cropName;
    private String variety;
    private Integer processId;
    private String processName;
    private Double areaM2;
    private Integer cropCount;
    private String locationCoords;
    private LocalDate startDate;
    private String status;
}
