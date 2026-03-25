package com.smartfarm.api.service;

import com.smartfarm.api.dto.TaskDto;
import com.smartfarm.api.entity.Task;
import com.smartfarm.api.mapper.TaskMapper;
import com.smartfarm.api.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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

    public List<TaskDto> findByBatchId(Long batchId) {
        // Gọi method có JOIN FETCH để lấy kèm Stage thông qua TaskTemplate
        List<Task> tasks = taskRepository.findTasksWithStageByBatchId(batchId);

        return tasks.stream()
                .map(taskMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> findByAssignedUser(Long userId) {
        return taskRepository.findByAssignedToUserId(userId).stream().map(taskMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> findByStatus(String status) {
        return taskRepository.findByStatus(status).stream().map(taskMapper::toDto).collect(Collectors.toList());
    }

    public Optional<TaskDto> findById(Long id) {
        return taskRepository.findById(id).map(taskMapper::toDto);
    }

    public TaskDto create(TaskDto dto) {
        Task entity = taskMapper.toEntity(dto);
        return taskMapper.toDto(taskRepository.save(entity));
    }

    public Optional<TaskDto> update(Long id, TaskDto dto) {
        if (!taskRepository.existsById(id))
            return Optional.empty();
        Task entity = taskMapper.toEntity(dto);
        entity.setTaskId(id);
        return Optional.of(taskMapper.toDto(taskRepository.save(entity)));
    }

    public boolean deleteById(Long id) {
        if (!taskRepository.existsById(id))
            return false;
        taskRepository.deleteById(id);
        return true;
    }

    @Transactional
    public Optional<TaskDto> updateStatus(Long id, String status) {
        return taskRepository.findById(id).map(task -> {
            // 1. Cập nhật trạng thái mới
            task.setStatus(status);

            // 2. Logic tự động:
            if ("COMPLETED".equalsIgnoreCase(status)) {
                // Nếu hoàn thành, ghi nhận ngày thực tế là hôm nay
                task.setActualDate(LocalDate.now());
            } else {
                // Nếu chuyển về PENDING/IN_PROGRESS, xóa ngày thực tế đã ghi nhận trước đó
                task.setActualDate(null);
            }

            // 3. Lưu vào DB
            Task updatedTask = taskRepository.save(task);

            // 4. Trả về DTO
            return taskMapper.toDto(updatedTask);
        });
    }
}
