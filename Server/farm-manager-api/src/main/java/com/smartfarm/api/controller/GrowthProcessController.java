package com.smartfarm.api.controller;

import com.smartfarm.api.dto.ApiResponse;
import com.smartfarm.api.dto.GrowthProcessDto;
import com.smartfarm.api.service.GrowthProcessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/growth-processes")
@CrossOrigin(origins = "*")
public class GrowthProcessController {

    private final GrowthProcessService growthProcessService;

    @Autowired
    public GrowthProcessController(GrowthProcessService growthProcessService) {
        this.growthProcessService = growthProcessService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GrowthProcessDto>>> getAll(
            @RequestParam(required = false) Integer cropId) {
        try {
            List<GrowthProcessDto> data = (cropId != null)
                    ? growthProcessService.findByCropId(cropId)
                    : growthProcessService.findAll();
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GrowthProcessDto>> getById(@PathVariable Integer id) {
        return growthProcessService.findById(id)
                .map(data -> ResponseEntity.ok(ApiResponse.success(data)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.notFound("GrowthProcess not found with id: " + id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GrowthProcessDto>> create(@RequestBody GrowthProcessDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(growthProcessService.create(dto), "GrowthProcess created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GrowthProcessDto>> update(@PathVariable Integer id, @RequestBody GrowthProcessDto dto) {
        try {
            return growthProcessService.update(id, dto)
                    .map(data -> ResponseEntity.ok(ApiResponse.success(data, "GrowthProcess updated successfully")))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.notFound("GrowthProcess not found with id: " + id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        try {
            if (growthProcessService.deleteById(id)) {
                return ResponseEntity.ok(ApiResponse.success(null, "GrowthProcess deleted successfully"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound("GrowthProcess not found with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }
}
