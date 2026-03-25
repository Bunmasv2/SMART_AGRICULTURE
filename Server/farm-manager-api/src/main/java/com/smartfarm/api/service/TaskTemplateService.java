package com.smartfarm.api.service;

import com.smartfarm.api.dto.TaskTemplateDto;
import com.smartfarm.api.entity.TaskTemplate;
import com.smartfarm.api.mapper.TaskTemplateMapper;
import com.smartfarm.api.repository.TaskTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskTemplateService {

    private final TaskTemplateRepository taskTemplateRepository;
    private final TaskTemplateMapper taskTemplateMapper;

    @Autowired
    public TaskTemplateService(TaskTemplateRepository taskTemplateRepository, TaskTemplateMapper taskTemplateMapper) {
        this.taskTemplateRepository = taskTemplateRepository;
        this.taskTemplateMapper = taskTemplateMapper;
    }

    public List<TaskTemplateDto> findAll() {
        return taskTemplateRepository.findAll().stream().map(taskTemplateMapper::toDto).collect(Collectors.toList());
    }

    public List<TaskTemplateDto> findByStageId(Integer stageId) {

        return taskTemplateRepository.findByStageStageId(stageId).stream().map(taskTemplateMapper::toDto).collect(Collectors.toList());
    }

    public Optional<TaskTemplateDto> findById(Integer id) {
        return taskTemplateRepository.findById(id).map(taskTemplateMapper::toDto);
    }

    public TaskTemplateDto create(TaskTemplateDto dto) {
        TaskTemplate entity = taskTemplateMapper.toEntity(dto);
        return taskTemplateMapper.toDto(taskTemplateRepository.save(entity));
    }

    public Optional<TaskTemplateDto> update(Integer id, TaskTemplateDto dto) {

        if (!taskTemplateRepository.existsById(id)) return Optional.empty();
        TaskTemplate entity = taskTemplateMapper.toEntity(dto);
        entity.setTaskTmpId(id);
        return Optional.of(taskTemplateMapper.toDto(taskTemplateRepository.save(entity)));
    }

    public boolean deleteById(Integer id) {
        if (!taskTemplateRepository.existsById(id)) return false;
        taskTemplateRepository.deleteById(id);
        return true;
    }
}
