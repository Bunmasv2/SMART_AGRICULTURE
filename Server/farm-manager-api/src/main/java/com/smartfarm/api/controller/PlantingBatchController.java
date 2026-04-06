package com.smartfarm.api.controller;

import com.smartfarm.api.dto.ApiResponse;
import com.smartfarm.api.dto.PlantingBatchDto;
import com.smartfarm.api.service.PlantingBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planting-batches")
@CrossOrigin(origins = "*")
public class PlantingBatchController {

    private final PlantingBatchService plantingBatchService;

    @Autowired
    public PlantingBatchController(PlantingBatchService plantingBatchService) {
        this.plantingBatchService = plantingBatchService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PlantingBatchDto>>> getAll(
            @RequestParam(required = false) String status) {
        try {
            List<PlantingBatchDto> data = (status != null)
                    ? plantingBatchService.findByStatus(status)
                    : plantingBatchService.findAll();
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlantingBatchDto>> getById(@PathVariable Integer id) {
        return plantingBatchService.findById(id)
                .map(data -> ResponseEntity.ok(ApiResponse.success(data)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.notFound("PlantingBatch not found with id: " + id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PlantingBatchDto>> create(
            @RequestBody PlantingBatchDto dto,
            @RequestHeader(value = "X-Role-Id", required = false) Integer roleId) {
        if (roleId != null && roleId > 2) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(403, "Chỉ Admin mới có quyền tạo lô canh tác mới ạ!"));
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(plantingBatchService.create(dto), "PlantingBatch created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PlantingBatchDto>> update(
            @PathVariable Integer id,
            @RequestBody PlantingBatchDto dto,
            @RequestHeader(value = "X-Role-Id", required = false) Integer roleId) {
        if (roleId != null && roleId > 2) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(403, "Chỉ Admin mới có quyền cập nhật thông tin lô ạ!"));
        }
        try {
            return plantingBatchService.update(id, dto)
                    .map(data -> ResponseEntity.ok(ApiResponse.success(data, "PlantingBatch updated successfully")))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.notFound("PlantingBatch not found with id: " + id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Integer id,
            @RequestHeader(value = "X-Role-Id", required = false) Integer roleId) {
        if (roleId != null && roleId > 2) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(403, "Chỉ Admin mới có quyền xóa lô canh tác ạ!"));
        }
        try {
            if (plantingBatchService.deleteById(id)) {
                return ResponseEntity.ok(ApiResponse.success(null, "PlantingBatch deleted successfully"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound("PlantingBatch not found with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @DeleteMapping("/bulk-delete")
    public ResponseEntity<ApiResponse<Void>> deleteMultiple(
            @RequestBody List<Integer> ids,
            @RequestHeader(value = "X-Role-Id", required = false) Integer roleId) {
        if (roleId != null && roleId > 2) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(403, "Chỉ Admin mới có quyền xóa hàng loạt lô ạ!"));
        }
        try {
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "Danh sách ID không được để trống ạ!"));
            }

            plantingBatchService.deleteMultipleByIds(ids);

            return ResponseEntity.ok(ApiResponse.success(null,
                    String.format("Đã xóa thành công %d lô canh tác", ids.size())));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Lỗi khi xóa hàng loạt: " + e.getMessage()));
        }
    }
}
