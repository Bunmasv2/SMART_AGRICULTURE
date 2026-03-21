package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.TaskTemplateDto;
import com.smartfarm.api.entity.InventoryItem;
import com.smartfarm.api.entity.Stage;
import com.smartfarm.api.entity.TaskTemplate;
import org.springframework.stereotype.Component;

@Component
public class TaskTemplateMapper {
    public TaskTemplateDto toDto(TaskTemplate entity) {
        if (entity == null) return null;
        TaskTemplateDto dto = TaskTemplateDto.builder()
                .taskTmpId(entity.getTaskTmpId())
                .taskName(entity.getTaskName())
                .quantityRequired(entity.getQuantityRequired())
                .offsetDay(entity.getOffsetDay())
                .build();
        if (entity.getStage() != null) {
            dto.setStageId(entity.getStage().getStageId());
            dto.setStageName(entity.getStage().getStageName());
        }
        if (entity.getItem() != null) {
            dto.setItemId(entity.getItem().getItemId());
            dto.setItemName(entity.getItem().getItemName());
        }
        return dto;
    }

    public TaskTemplate toEntity(TaskTemplateDto dto) {
        if (dto == null) return null;
        TaskTemplate entity = TaskTemplate.builder()
                .taskTmpId(dto.getTaskTmpId())
                .taskName(dto.getTaskName())
                .quantityRequired(dto.getQuantityRequired())
                .offsetDay(dto.getOffsetDay())
                .build();
        if (dto.getStageId() != null) {
            entity.setStage(Stage.builder().stageId(dto.getStageId()).build());
        }
        if (dto.getItemId() != null) {
            entity.setItem(InventoryItem.builder().itemId(dto.getItemId()).build());
        }
        return entity;
    }
}
