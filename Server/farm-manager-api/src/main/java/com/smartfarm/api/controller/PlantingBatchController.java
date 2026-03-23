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
    public ResponseEntity<ApiResponse<PlantingBatchDto>> create(@RequestBody PlantingBatchDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(plantingBatchService.create(dto), "PlantingBatch created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PlantingBatchDto>> update(@PathVariable Integer id, @RequestBody PlantingBatchDto dto) {
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
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
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
}
