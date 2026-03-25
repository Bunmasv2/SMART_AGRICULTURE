package com.smartfarm.api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartfarm.api.dto.ApiResponse;
import com.smartfarm.api.dto.TaskDto;
import com.smartfarm.api.dto.TaskProgressDTO;
import com.smartfarm.api.service.TaskService;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskDto>>> getAll(
            @RequestParam(required = false) Integer pBatchId,
            @RequestParam(required = false) Integer assignedTo,
            @RequestParam(required = false) String status) {
        try {
            List<TaskDto> data;
            if (pBatchId != null) {
                data = taskService.findByBatchId(pBatchId);
            } else if (assignedTo != null) {
                data = taskService.findByAssignedUser(assignedTo);
            } else if (status != null) {
                data = taskService.findByStatus(status);
            } else {
                data = taskService.findAll();
            }
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getTasksByBatch(@PathVariable Integer batchId) {
        List<TaskDto> tasks = taskService.findByBatchId(batchId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskDto>> updateStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        // Chuyển đổi status sang viết hoa để đồng nhất dữ liệu
        String upperStatus = status.toUpperCase();

        return taskService.updateStatus(id, upperStatus)
                .map(data -> ResponseEntity.ok(ApiResponse.success(data)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.notFound("Không tìm thấy công việc với ID: " + id)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDto>> getById(@PathVariable Integer id) {
        return taskService.findById(id)
                .map(data -> ResponseEntity.ok(ApiResponse.success(data)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.notFound("Task not found with id: " + id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskDto>> create(@RequestBody TaskDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(taskService.create(dto), "Task created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDto>> update(@PathVariable Integer id, @RequestBody TaskDto dto) {
        try {
            return taskService.update(id, dto)
                    .map(data -> ResponseEntity.ok(ApiResponse.success(data, "Task updated successfully")))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.notFound("Task not found with id: " + id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        try {
            if (taskService.deleteById(id)) {
                return ResponseEntity.ok(ApiResponse.success(null, "Task deleted successfully"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound("Task not found with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    /**
     * Đánh dấu task hoàn thành
     * PUT /api/tasks/{id}/complete
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<TaskDto>> markAsCompleted(@PathVariable Integer id) {
        try {
            TaskDto completedTask = taskService.markTaskAsCompleted(id);
            return ResponseEntity.ok(ApiResponse.success(completedTask, "Task marked as completed"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    /**
     * Lấy tiến độ hoàn thành của một batch
     * GET /api/tasks/batch/{pBatchId}/progress
     */
    @GetMapping("/batch/{pBatchId}/progress")
    public ResponseEntity<ApiResponse<TaskProgressDTO>> getBatchProgress(@PathVariable Integer pBatchId) {
        try {
            TaskProgressDTO progress = taskService.getBatchProgress(pBatchId);
            return ResponseEntity.ok(ApiResponse.success(progress));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }
}
