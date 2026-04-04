package com.smartfarm.api.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

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

    public AiAnalysisController(AiAnalysisService aiAnalysisService) {
        this.aiAnalysisService = aiAnalysisService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AiAnalysisDto>>> getAll(
            @RequestParam(required = false) Integer pBatchId,
            @RequestParam(required = false, defaultValue = "desc") String order,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        try {
            boolean oldestFirst = "asc".equalsIgnoreCase(order);
            List<AiAnalysisDto> data = (pBatchId != null)
                    ? aiAnalysisService.findByBatchId(pBatchId, oldestFirst, page, size)
                    : aiAnalysisService.findAll(oldestFirst, page, size);
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

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamBatchEvents(@RequestParam("pBatchId") Integer pBatchId) {
        return aiAnalysisService.subscribeToBatchEvents(pBatchId);
    }

    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getStoredImage(@PathVariable String filename) {
        try {
            Resource resource = aiAnalysisService.loadStoredImage(filename);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<AiAnalysisDto>>> uploadWorkerImages(
            @RequestParam("pBatchId") Integer pBatchId,
            @RequestParam("imageFiles") List<MultipartFile> imageFiles,
            @RequestParam(value = "workerNote", required = false) String workerNote) {
        try {
            List<AiAnalysisDto> data = aiAnalysisService.enqueueWorkerImages(pBatchId, imageFiles, workerNote);
            return ResponseEntity.ok(ApiResponse.success(data, "Images uploaded and queued for analysis"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (AiServiceException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Unexpected error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<ApiResponse<AiAnalysisDto>> analyzeById(
            @PathVariable Integer id,
            @RequestParam(value = "adminNote", required = false) String adminNote) {
        try {
            AiAnalysisDto data = aiAnalysisService.analyzeQueuedImage(id, adminNote);
            return ResponseEntity.ok(ApiResponse.success(data, "Image analysis processed"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Unexpected error: " + e.getMessage()));
        }
    }

    @PostMapping("/analyze-all")
    public ResponseEntity<ApiResponse<List<AiAnalysisDto>>> analyzeAllInBatch(
            @RequestParam("pBatchId") Integer pBatchId,
            @RequestParam(value = "adminNote", required = false) String adminNote) {
        try {
            List<AiAnalysisDto> data = aiAnalysisService.analyzeAllForBatch(pBatchId, adminNote);
            return ResponseEntity.ok(ApiResponse.success(data, "Batch analysis completed"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Unexpected error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<ApiResponse<AiAnalysisDto>> retryAnalyze(
            @PathVariable Integer id,
            @RequestParam(value = "adminNote", required = false) String adminNote) {
        try {
            AiAnalysisDto data = aiAnalysisService.retryAnalysis(id, adminNote);
            return ResponseEntity.ok(ApiResponse.success(data, "Retry analysis completed"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Unexpected error: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/{id}/replace-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AiAnalysisDto>> replaceImage(
            @PathVariable Integer id,
            @RequestParam("imageFile") MultipartFile imageFile,
            @RequestParam(value = "workerNote", required = false) String workerNote) {
        try {
            AiAnalysisDto data = aiAnalysisService.replaceImage(id, imageFile, workerNote);
            return ResponseEntity.ok(ApiResponse.success(data, "Image replaced and re-queued"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (AiServiceException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Unexpected error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/final")
    public ResponseEntity<ApiResponse<AiAnalysisDto>> markFinalResult(@PathVariable Integer id) {
        try {
            AiAnalysisDto data = aiAnalysisService.markAsFinalResult(id);
            return ResponseEntity.ok(ApiResponse.success(data, "Final result selected"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (AiServiceException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Unexpected error: " + e.getMessage()));
        }
    }

    /**
     * Legacy endpoint: phân tích ảnh ngay lập tức.
     */
    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<AiAnalysisResponseDTO>> analyzeLeafImage(
            @RequestParam("pBatchId") Integer pBatchId,
            @RequestParam("imageFile") MultipartFile imageFile) {
        try {
            if (imageFile.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error(400, "Image file is required"));
            }

            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error(400, "File must be an image (JPG, PNG, etc.)"));
            }

            AiAnalysisResponseDTO result = aiAnalysisService.analyzeLeafImage(pBatchId, imageFile);
            return ResponseEntity.ok(ApiResponse.success(result, "Image analyzed successfully"));

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (AiServiceException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error(503, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Unexpected error: " + e.getMessage()));
        }
    }
}
