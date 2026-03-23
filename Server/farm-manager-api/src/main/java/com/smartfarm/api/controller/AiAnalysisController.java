package com.smartfarm.api.controller;

import com.smartfarm.api.dto.ApiResponse;
import com.smartfarm.api.dto.AiAnalysisDto;
import com.smartfarm.api.dto.AiAnalysisResponseDTO;
import com.smartfarm.api.service.AiAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ai-analyses")
@CrossOrigin(origins = "*")
public class AiAnalysisController {

    private final AiAnalysisService aiAnalysisService;

    @Autowired
    public AiAnalysisController(AiAnalysisService aiAnalysisService) {
        this.aiAnalysisService = aiAnalysisService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AiAnalysisDto>>> getAll(
            @RequestParam(required = false) Integer pBatchId) {
        try {
            List<AiAnalysisDto> data = (pBatchId != null)
                    ? aiAnalysisService.findByBatchId(pBatchId)
                    : aiAnalysisService.findAll();
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AiAnalysisDto>> getById(@PathVariable Long id) {
        return aiAnalysisService.findById(id)
                .map(data -> ResponseEntity.ok(ApiResponse.success(data)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.notFound("AiAnalysis not found with id: " + id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AiAnalysisDto>> create(@RequestBody AiAnalysisDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(aiAnalysisService.create(dto), "AiAnalysis created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AiAnalysisDto>> update(@PathVariable Long id, @RequestBody AiAnalysisDto dto) {
        try {
            return aiAnalysisService.update(id, dto)
                    .map(data -> ResponseEntity.ok(ApiResponse.success(data, "AiAnalysis updated successfully")))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.notFound("AiAnalysis not found with id: " + id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            if (aiAnalysisService.deleteById(id)) {
                return ResponseEntity.ok(ApiResponse.success(null, "AiAnalysis deleted successfully"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound("AiAnalysis not found with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    /**
     * Phân tích ảnh lá cây chanh bằng AI
     * POST /api/ai-analyses/analyze
     */
    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<AiAnalysisResponseDTO>> analyzeLeafImage(
            @RequestParam("pBatchId") Integer pBatchId,
            @RequestParam("imageFile") MultipartFile imageFile) {
        try {
            // Validate file
            if (imageFile.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error(400, "Image file is required"));
            }

            // Gọi service phân tích
            AiAnalysisResponseDTO result = aiAnalysisService.analyzeLeafImage(pBatchId, imageFile);

            return ResponseEntity.ok(ApiResponse.success(result, "Image analyzed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Error analyzing image: " + e.getMessage()));
        }
    }
}
