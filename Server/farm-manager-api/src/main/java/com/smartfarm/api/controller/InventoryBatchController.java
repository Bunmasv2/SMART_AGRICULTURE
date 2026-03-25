package com.smartfarm.api.controller;

import com.smartfarm.api.dto.ApiResponse;
import com.smartfarm.api.dto.InventoryBatchDto;
import com.smartfarm.api.service.InventoryBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory-batches")
@CrossOrigin(origins = "*")
public class InventoryBatchController {

    private final InventoryBatchService inventoryBatchService;

    @Autowired
    public InventoryBatchController(InventoryBatchService inventoryBatchService) {
        this.inventoryBatchService = inventoryBatchService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryBatchDto>>> getAll(

            @RequestParam(required = false) Integer itemId,
            @RequestParam(required = false) String category) {
        try {
            List<InventoryBatchDto> data;
            if (itemId != null) {
                data = inventoryBatchService.findByItemId(itemId);
            } else if (category != null) {
                data = inventoryBatchService.findByCategory(category);
            } else {
                data = inventoryBatchService.findAll();
            }
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryBatchDto>> getById(@PathVariable Integer id) {
        return inventoryBatchService.findById(id)
                .map(data -> ResponseEntity.ok(ApiResponse.success(data)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.notFound("InventoryBatch not found with id: " + id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InventoryBatchDto>> create(@RequestBody InventoryBatchDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(inventoryBatchService.create(dto),
                            "InventoryBatch created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryBatchDto>> update(@PathVariable Integer id, @RequestBody InventoryBatchDto dto) {
        try {
            return inventoryBatchService.update(id, dto)
                    .map(data -> ResponseEntity.ok(ApiResponse.success(data, "InventoryBatch updated successfully")))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.notFound("InventoryBatch not found with id: " + id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        try {
            if (inventoryBatchService.deleteById(id)) {
                return ResponseEntity.ok(ApiResponse.success(null, "InventoryBatch deleted successfully"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound("InventoryBatch not found with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }
}
