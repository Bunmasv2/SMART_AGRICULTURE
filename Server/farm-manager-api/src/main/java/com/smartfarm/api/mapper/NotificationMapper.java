package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.NotificationDto;
import com.smartfarm.api.entity.Notification;
import com.smartfarm.api.entity.PlantingBatch;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationDto toDto(Notification entity) {
        if (entity == null) return null;

        NotificationDto dto = NotificationDto.builder()
                .notificationId(entity.getNotificationId())
                .message(entity.getMessage())
                .isRead(entity.getIsRead())
                .createdAt(entity.getCreatedAt())
                .build();

        if (entity.getPlantingBatch() != null) {
            dto.setPBatchId(entity.getPlantingBatch().getPBatchId());
            dto.setBatchName(entity.getPlantingBatch().getBatchName());
        }

        return dto;
    }

    public Notification toEntity(NotificationDto dto) {
        if (dto == null) return null;

        Notification entity = Notification.builder()
                .notificationId(dto.getNotificationId())
                .message(dto.getMessage())
                .isRead(dto.getIsRead())
                .createdAt(dto.getCreatedAt())
                .build();

        if (dto.getPBatchId() != null) {
            entity.setPlantingBatch(PlantingBatch.builder().pBatchId(dto.getPBatchId()).build());
        }

        return entity;
    }
}
