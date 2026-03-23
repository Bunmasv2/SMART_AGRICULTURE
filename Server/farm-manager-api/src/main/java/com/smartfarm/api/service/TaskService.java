package com.smartfarm.api.service;

import com.smartfarm.api.dto.TaskDto;
import com.smartfarm.api.entity.Task;
import com.smartfarm.api.mapper.TaskMapper;
import com.smartfarm.api.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    @Autowired
    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    public List<TaskDto> findAll() {
        return taskRepository.findAll().stream().map(taskMapper::toDto).collect(Collectors.toList());
    }

    public List<TaskDto> findByBatchId(Integer pBatchId) {
        return taskRepository.findByPlantingBatchPBatchId(pBatchId).stream().map(taskMapper::toDto).collect(Collectors.toList());
    }

    public List<TaskDto> findByAssignedUser(Integer userId) {
        return taskRepository.findByAssignedToUserId(userId).stream().map(taskMapper::toDto).collect(Collectors.toList());
    }

    public List<TaskDto> findByStatus(String status) {
        return taskRepository.findByStatus(status).stream().map(taskMapper::toDto).collect(Collectors.toList());
    }

    public Optional<TaskDto> findById(Integer id) {
        return taskRepository.findById(id).map(taskMapper::toDto);
    }

    public TaskDto create(TaskDto dto) {
        Task entity = taskMapper.toEntity(dto);
        return taskMapper.toDto(taskRepository.save(entity));
    }

    public Optional<TaskDto> update(Integer id, TaskDto dto) {
        if (!taskRepository.existsById(id)) return Optional.empty();
        Task entity = taskMapper.toEntity(dto);
        entity.setTaskId(id);
        return Optional.of(taskMapper.toDto(taskRepository.save(entity)));
    }

    public boolean deleteById(Integer id) {
        if (!taskRepository.existsById(id)) return false;
        taskRepository.deleteById(id);
        return true;
    }
}
