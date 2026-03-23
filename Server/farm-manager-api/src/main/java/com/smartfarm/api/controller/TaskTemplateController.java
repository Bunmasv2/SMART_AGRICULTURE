package com.smartfarm.api.controller;

import com.smartfarm.api.dto.ApiResponse;
import com.smartfarm.api.dto.TaskTemplateDto;
import com.smartfarm.api.service.TaskTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/task-templates")
@CrossOrigin(origins = "*")
public class TaskTemplateController {

    private final TaskTemplateService taskTemplateService;

    @Autowired
    public TaskTemplateController(TaskTemplateService taskTemplateService) {
        this.taskTemplateService = taskTemplateService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskTemplateDto>>> getAll(
            @RequestParam(required = false) Integer stageId) {
        try {
            List<TaskTemplateDto> data = (stageId != null)
                    ? taskTemplateService.findByStageId(stageId)
                    : taskTemplateService.findAll();
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskTemplateDto>> getById(@PathVariable Integer id) {
        return taskTemplateService.findById(id)
                .map(data -> ResponseEntity.ok(ApiResponse.success(data)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.notFound("TaskTemplate not found with id: " + id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskTemplateDto>> create(@RequestBody TaskTemplateDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(taskTemplateService.create(dto), "TaskTemplate created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskTemplateDto>> update(@PathVariable Integer id, @RequestBody TaskTemplateDto dto) {
        try {
            return taskTemplateService.update(id, dto)
                    .map(data -> ResponseEntity.ok(ApiResponse.success(data, "TaskTemplate updated successfully")))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.notFound("TaskTemplate not found with id: " + id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        try {
            if (taskTemplateService.deleteById(id)) {
                return ResponseEntity.ok(ApiResponse.success(null, "TaskTemplate deleted successfully"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound("TaskTemplate not found with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }
}
