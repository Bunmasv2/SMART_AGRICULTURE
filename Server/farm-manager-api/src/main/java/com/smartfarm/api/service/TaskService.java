package com.smartfarm.api.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartfarm.api.dto.TaskDto;
import com.smartfarm.api.dto.TaskProgressDTO;
import com.smartfarm.api.entity.Task;
import com.smartfarm.api.mapper.TaskMapper;
import com.smartfarm.api.repository.TaskRepository;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    public List<TaskDto> findAll() {
        return taskRepository.findAll().stream().map(taskMapper::toDto).collect(Collectors.toList());
    }

    public List<TaskDto> findByBatchId(Integer batchId) {
        // Gọi method có JOIN FETCH để lấy kèm Stage thông qua TaskTemplate
        List<Task> tasks = taskRepository.findTasksWithStageByBatchId(batchId);

        return tasks.stream()
                .map(taskMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> findByAssignedUser(Integer userId) {
        return taskRepository.findByAssignedToUserId(userId).stream().map(taskMapper::toDto)
                .collect(Collectors.toList());
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
        if (!taskRepository.existsById(id)) {
            return Optional.empty();
        }
        Task entity = taskMapper.toEntity(dto);
        entity.setTaskId(id);
        return Optional.of(taskMapper.toDto(taskRepository.save(entity)));
    }

    public boolean deleteById(Integer id) {
        if (!taskRepository.existsById(id)) {
            return false;
        }
        taskRepository.deleteById(id);
        return true;
    }

    @Transactional
    public Optional<TaskDto> updateStatus(Integer id, String status) {
        return taskRepository.findById(id).flatMap(task -> {

            LocalDate today = LocalDate.now();

            // ❗ Không đúng ngày → chặn update
            if (!today.equals(task.getPlannedDate())) {
                return Optional.empty(); // ✅ đúng
            }

            task.setStatus(status.toUpperCase());

            if ("COMPLETED".equalsIgnoreCase(status)) {
                task.setActualDate(today);
            } else {
                task.setActualDate(null);
            }

            Task updatedTask = taskRepository.save(task);

            return Optional.of(taskMapper.toDto(updatedTask));
        });
    }

    @Transactional
    public TaskDto markTaskAsCompleted(Integer taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        // Cập nhật actualDate và status
        task.setActualDate(LocalDate.now());
        task.setStatus("COMPLETED");

        Task savedTask = taskRepository.save(task);
        return taskMapper.toDto(savedTask);
    }

    /**
     * Lấy thông tin tiến độ hoàn thành của một batch
     * Trả về TaskProgressDTO với tổng task, task đã hoàn thành, % hoàn thành
     */
    @Transactional(readOnly = true)
    public TaskProgressDTO getBatchProgress(Integer pBatchId) {
        // Đếm tổng số task của batch
        Long totalTasks = taskRepository.countByPlantingBatchPBatchId(pBatchId);

        if (totalTasks == null || totalTasks == 0) {
            throw new RuntimeException("No tasks found for batch with id: " + pBatchId);
        }

        // Đếm số task có status = 'COMPLETED'
        Long completedTasks = taskRepository.countByPlantingBatchPBatchIdAndStatus(pBatchId, "COMPLETED");

        // Tính phần trăm hoàn thành
        double percentage = (completedTasks.doubleValue() / totalTasks.doubleValue()) * 100.0;

        return TaskProgressDTO.builder()
                .totalTasks(totalTasks.intValue())
                .completedTasks(completedTasks.intValue())
                .completionPercentage(Math.round(percentage * 100.0) / 100.0) // Làm tròn 2 số thập phân
                .build();
    }
}
