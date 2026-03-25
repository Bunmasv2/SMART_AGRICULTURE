package com.smartfarm.api.controller;

import com.smartfarm.api.dto.ApiResponse;
import com.smartfarm.api.dto.CreateFertilizerRequest;
import com.smartfarm.api.dto.InventoryItemDto;
import com.smartfarm.api.service.InventoryItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory-items")
@CrossOrigin(origins = "*")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    @GetMapping("/fertilizers")
    public List<Map<String, Object>> getAll() {
        return inventoryItemService.getAllFertilizers();
    }

    @GetMapping("/pesticides")
    public List<Map<String, Object>> getAllPesticide() {
        return inventoryItemService.getAllPesticides();
    }

    @PostMapping("/add")
    public String create(@RequestBody CreateFertilizerRequest request) {
        inventoryItemService.createFertilizer(request);
        return "success";
    }

    @PutMapping("/batches/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id,
            @RequestBody CreateFertilizerRequest req) {
        inventoryItemService.updateFertilizer(id, req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/batches/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Integer id) {
        inventoryItemService.deleteFertilizer(id);
        return ResponseEntity.ok().build();
    }

    @Autowired
    public InventoryItemController(InventoryItemService inventoryItemService) {
        this.inventoryItemService = inventoryItemService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryItemDto>>> getAll(
            @RequestParam(required = false) String category) {
        try {
            List<InventoryItemDto> data = (category != null)
                    ? inventoryItemService.findByCategory(category)
                    : inventoryItemService.findAll();
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryItemDto>> getById(@PathVariable Integer id) {
        return inventoryItemService.findById(id)
                .map(data -> ResponseEntity.ok(ApiResponse.success(data)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.notFound("InventoryItem not found with id: " + id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InventoryItemDto>> create(@RequestBody InventoryItemDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(inventoryItemService.create(dto), "InventoryItem created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryItemDto>> update(@PathVariable Integer id,
            @RequestBody InventoryItemDto dto) {
        try {
            return inventoryItemService.update(id, dto)
                    .map(data -> ResponseEntity.ok(ApiResponse.success(data, "InventoryItem updated successfully")))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.notFound("InventoryItem not found with id: " + id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        try {
            if (inventoryItemService.deleteById(id)) {
                return ResponseEntity.ok(ApiResponse.success(null, "InventoryItem deleted successfully"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound("InventoryItem not found with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }
}
