package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.TaskDto;
import com.smartfarm.api.entity.PlantingBatch;
import com.smartfarm.api.entity.Task;
import com.smartfarm.api.entity.TaskTemplate;
import com.smartfarm.api.entity.User;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {
    public TaskDto toDto(Task entity) {
        if (entity == null)
            return null;
        TaskDto dto = TaskDto.builder()
                .taskId(entity.getTaskId())
                .title(entity.getTitle())
                .plannedDate(entity.getPlannedDate())
                .actualDate(entity.getActualDate())
                .status(entity.getStatus())
                .notes(entity.getNotes())
                .build();

        // Mapping từ TaskTemplate để lấy thông tin Stage
        if (entity.getTaskTemplate() != null) {
            dto.setTaskTmpId(entity.getTaskTemplate().getTaskTmpId());
            dto.setTaskTemplateName(entity.getTaskTemplate().getTaskName());

            // Lấy Stage ID và Name từ Template
            if (entity.getTaskTemplate().getStage() != null) {
                dto.setStageId(entity.getTaskTemplate().getStage().getStageId());
                dto.setStageName(entity.getTaskTemplate().getStage().getStageName());
            }
        }

        if (entity.getPlantingBatch() != null) {
            dto.setPBatchId(entity.getPlantingBatch().getPBatchId());
            dto.setBatchName(entity.getPlantingBatch().getBatchName());
        }
        if (entity.getTaskTemplate() != null) {
            dto.setTaskTmpId(entity.getTaskTemplate().getTaskTmpId());
            dto.setTaskTemplateName(entity.getTaskTemplate().getTaskName());
        }
        if (entity.getAssignedTo() != null) {
            dto.setAssignedToId(entity.getAssignedTo().getUserId());
            dto.setAssignedToName(entity.getAssignedTo().getFullName());
        }
        return dto;
    }

    public Task toEntity(TaskDto dto) {
        if (dto == null)
            return null;
        Task entity = Task.builder()
                .taskId(dto.getTaskId())
                .title(dto.getTitle())
                .plannedDate(dto.getPlannedDate())
                .actualDate(dto.getActualDate())
                .status(dto.getStatus())
                .notes(dto.getNotes())
                .build();
        if (dto.getPBatchId() != null) {
            entity.setPlantingBatch(PlantingBatch.builder().pBatchId(dto.getPBatchId()).build());
        }
        if (dto.getTaskTmpId() != null) {
            entity.setTaskTemplate(TaskTemplate.builder().taskTmpId(dto.getTaskTmpId()).build());
        }
        if (dto.getAssignedToId() != null) {
            entity.setAssignedTo(User.builder().userId(dto.getAssignedToId()).build());
        }
        return entity;
    }
}
