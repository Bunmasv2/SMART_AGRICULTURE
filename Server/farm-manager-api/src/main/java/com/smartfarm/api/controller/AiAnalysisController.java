package com.smartfarm.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smartfarm.api.dto.AiAnalysisDto;
import com.smartfarm.api.dto.AiAnalysisResponseDTO;
import com.smartfarm.api.dto.ApiResponse;
import com.smartfarm.api.exception.AiServiceException;
import com.smartfarm.api.exception.ResourceNotFoundException;
import com.smartfarm.api.service.AiAnalysisService;

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
    public ResponseEntity<ApiResponse<AiAnalysisDto>> getById(@PathVariable Integer id) {
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
    public ResponseEntity<ApiResponse<AiAnalysisDto>> update(@PathVariable Integer id, @RequestBody AiAnalysisDto dto) {
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
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
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
     *
     * @param pBatchId - ID của lô trồng
     * @param imageFile - File ảnh lá cây
     * @return AiAnalysisResponseDTO với kết quả phân tích
     *
     * HTTP Status Codes:
     * - 200 OK: Phân tích thành công
     * - 400 BAD REQUEST: File rỗng hoặc không hợp lệ
     * - 404 NOT FOUND: Không tìm thấy PlantingBatch
     * - 503 SERVICE UNAVAILABLE: AI service lỗi
     * - 500 INTERNAL SERVER ERROR: Lỗi không xác định
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

            // Validate file type
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error(400, "File must be an image (JPG, PNG, etc.)"));
            }

            // Gọi service phân tích
            AiAnalysisResponseDTO result = aiAnalysisService.analyzeLeafImage(pBatchId, imageFile);

            return ResponseEntity.ok(ApiResponse.success(result, "Image analyzed successfully"));

        } catch (ResourceNotFoundException e) {
            // 404 - PlantingBatch not found
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));

        } catch (AiServiceException e) {
            // 503 - AI service unavailable or failed
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error(503, e.getMessage()));

        } catch (Exception e) {
            // 500 - Unexpected error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Unexpected error: " + e.getMessage()));
        }
    }
}
