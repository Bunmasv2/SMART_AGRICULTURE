package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.StageDto;
import com.smartfarm.api.entity.GrowthProcess;
import com.smartfarm.api.entity.Stage;
import org.springframework.stereotype.Component;

@Component
public class StageMapper {
    public StageDto toDto(Stage entity) {
        if (entity == null) return null;
        StageDto dto = StageDto.builder()
                .stageId(entity.getStageId())
                .stageName(entity.getStageName())
                .startDay(entity.getStartDay())
                .endDay(entity.getEndDay())
                .build();
        if (entity.getProcess() != null) {
            dto.setProcessId(entity.getProcess().getProcessId());
            dto.setProcessName(entity.getProcess().getProcessName());
        }
        return dto;
    }

    public Stage toEntity(StageDto dto) {
        if (dto == null) return null;
        Stage entity = Stage.builder()
                .stageId(dto.getStageId())
                .stageName(dto.getStageName())
                .startDay(dto.getStartDay())
                .endDay(dto.getEndDay())
                .build();
        if (dto.getProcessId() != null) {
            entity.setProcess(GrowthProcess.builder().processId(dto.getProcessId()).build());
        }
        return entity;
    }
}
