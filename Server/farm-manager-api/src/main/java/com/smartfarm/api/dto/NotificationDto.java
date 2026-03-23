package com.smartfarm.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {

    private Integer notificationId;
    private Integer pBatchId;
    private String batchName;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
