package com.smartfarm.api.mapper;

import org.springframework.stereotype.Component;

import com.smartfarm.api.dto.TaskDto;
import com.smartfarm.api.entity.PlantingBatch;
import com.smartfarm.api.entity.Task;
import com.smartfarm.api.entity.TaskTemplate;
import com.smartfarm.api.entity.User;

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
        if (entity.getAssignedTo() != null) {
            dto.setAssignedToId(entity.getAssignedTo().getUserId());
            dto.setAssignedToName(entity.getAssignedTo().getFullName());
        }
        return dto;
    }

    public Task toEntity(TaskDto dto) {
        if (dto == null)
            return null;
        Task entity = new Task();
        entity.setTaskId(dto.getTaskId());
        entity.setTitle(dto.getTitle());
        entity.setPlannedDate(dto.getPlannedDate());
        entity.setActualDate(dto.getActualDate());
        entity.setStatus(dto.getStatus());
        entity.setNotes(dto.getNotes());
        if (dto.getPBatchId() != null) {
            PlantingBatch plantingBatch = new PlantingBatch();
            plantingBatch.setpBatchId(dto.getPBatchId());
            entity.setPlantingBatch(plantingBatch);
        }
        if (dto.getTaskTmpId() != null) {
            TaskTemplate taskTemplate = new TaskTemplate();
            taskTemplate.setTaskTmpId(dto.getTaskTmpId());
            entity.setTaskTemplate(taskTemplate);
        }
        if (dto.getAssignedToId() != null) {
            User assignedTo = new User();
            assignedTo.setUserId(dto.getAssignedToId());
            entity.setAssignedTo(assignedTo);
        }
        return entity;
    }
}