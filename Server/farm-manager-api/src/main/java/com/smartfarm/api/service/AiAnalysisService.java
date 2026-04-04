package com.smartfarm.api.service;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import javax.imageio.ImageIO;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.smartfarm.api.dto.AiAnalysisDto;
import com.smartfarm.api.dto.AiAnalysisResponseDTO;
import com.smartfarm.api.entity.AiAnalysis;
import com.smartfarm.api.entity.PlantingBatch;
import com.smartfarm.api.enums.AiAnalysisStatus;
import com.smartfarm.api.enums.DiseaseMapping;
import com.smartfarm.api.exception.AiServiceException;
import com.smartfarm.api.exception.ResourceNotFoundException;
import com.smartfarm.api.mapper.AiAnalysisMapper;
import com.smartfarm.api.repository.AiAnalysisRepository;
import com.smartfarm.api.repository.PlantingBatchRepository;

@Service
@Transactional
public class AiAnalysisService {

    private final AiAnalysisRepository aiAnalysisRepository;
    private final AiAnalysisMapper aiAnalysisMapper;
    private final PlantingBatchRepository plantingBatchRepository;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final AiAnalysisSseService aiAnalysisSseService;

    private static final String PYTHON_AI_URL = "http://localhost:8000/api/predict-leaf";
    private static final int MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );
    private static final Path IMAGE_STORAGE_DIR = Path.of("uploads", "ai-analysis").toAbsolutePath().normalize();
    private static final int MODEL_INPUT_WIDTH = 224;
    private static final int MODEL_INPUT_HEIGHT = 224;
    private static final int THUMBNAIL_MAX_WIDTH = 320;
    private static final int THUMBNAIL_MAX_HEIGHT = 320;
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    private record StoredImagePaths(String originalPath, String thumbnailPath) {
    }

    public AiAnalysisService(
            AiAnalysisRepository aiAnalysisRepository,
            AiAnalysisMapper aiAnalysisMapper,
            PlantingBatchRepository plantingBatchRepository,
            RestClient restClient,
            ObjectMapper objectMapper,
            AiAnalysisSseService aiAnalysisSseService) {
        this.aiAnalysisRepository = aiAnalysisRepository;
        this.aiAnalysisMapper = aiAnalysisMapper;
        this.plantingBatchRepository = plantingBatchRepository;
        this.restClient = restClient;
        this.objectMapper = objectMapper;
        this.aiAnalysisSseService = aiAnalysisSseService;
    }

    public List<AiAnalysisDto> findAll() {
        return findAll(false, null, null);
    }

    public List<AiAnalysisDto> findAll(boolean oldestFirst, Integer page, Integer size) {
        if (shouldUsePagination(page, size)) {
            Pageable pageable = buildPageable(page, size, oldestFirst);
            return aiAnalysisRepository.findAll(pageable)
                    .stream()
                    .map(aiAnalysisMapper::toDto)
                    .collect(Collectors.toList());
        }

        return aiAnalysisRepository.findAll(buildSort(oldestFirst)).stream()
                .map(aiAnalysisMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<AiAnalysisDto> findByBatchId(Integer pBatchId) {
        return findByBatchId(pBatchId, false, null, null);
    }

    public List<AiAnalysisDto> findByBatchId(Integer pBatchId, boolean oldestFirst) {
        return findByBatchId(pBatchId, oldestFirst, null, null);
    }

    public List<AiAnalysisDto> findByBatchId(Integer pBatchId, boolean oldestFirst, Integer page, Integer size) {
        if (shouldUsePagination(page, size)) {
            Pageable pageable = buildPageable(page, size, oldestFirst);
            return aiAnalysisRepository.findByPlantingBatchPBatchId(pBatchId, pageable)
                    .stream()
                    .map(aiAnalysisMapper::toDto)
                    .collect(Collectors.toList());
        }

        List<AiAnalysis> entities = oldestFirst
                ? aiAnalysisRepository.findByPlantingBatchPBatchIdOrderByCreatedAtAsc(pBatchId)
                : aiAnalysisRepository.findByPlantingBatchPBatchIdOrderByCreatedAtDesc(pBatchId);

        return entities.stream().map(aiAnalysisMapper::toDto).collect(Collectors.toList());
    }

    public Optional<AiAnalysisDto> findById(Integer id) {
        return aiAnalysisRepository.findById(id).map(aiAnalysisMapper::toDto);
    }

    public AiAnalysisDto create(AiAnalysisDto dto) {
        AiAnalysis entity = aiAnalysisMapper.toEntity(dto);
        return aiAnalysisMapper.toDto(aiAnalysisRepository.save(entity));
    }

    public Optional<AiAnalysisDto> update(Integer id, AiAnalysisDto dto) {
        if (!aiAnalysisRepository.existsById(id)) return Optional.empty();
        AiAnalysis entity = aiAnalysisMapper.toEntity(dto);
        entity.setAnalysisId(id);
        return Optional.of(aiAnalysisMapper.toDto(aiAnalysisRepository.save(entity)));
    }

    public boolean deleteById(Integer id) {
        Optional<AiAnalysis> analysisOpt = aiAnalysisRepository.findById(id);
        if (analysisOpt.isEmpty()) {
            return false;
        }

        AiAnalysis analysis = analysisOpt.get();
        Integer pBatchId = analysis.getPlantingBatch() != null ? analysis.getPlantingBatch().getPBatchId() : null;
        String thumbnailPath = extractThumbnailPath(analysis.getResultJson());

        aiAnalysisRepository.deleteById(id);
        deleteManagedImagesAfterCommit(analysis.getImagePath(), thumbnailPath);

        publishWorkflowEventSafely(
            pBatchId,
            "analysis_deleted",
            "Đã xóa ảnh lá",
            id,
            null
        );

        return true;
    }

    public List<AiAnalysisDto> enqueueWorkerImages(Integer pBatchId, List<MultipartFile> imageFiles, String workerNote) {
        if (imageFiles == null || imageFiles.isEmpty()) {
            throw new AiServiceException("Danh sách ảnh không được để trống");
        }

        if (imageFiles.size() > 2) {
            throw new AiServiceException("Mỗi lần xác nhận chỉ được gửi tối đa 2 ảnh");
        }

        PlantingBatch batch = plantingBatchRepository.findById(pBatchId)
                .orElseThrow(() -> new ResourceNotFoundException("PlantingBatch", pBatchId));

        List<AiAnalysisDto> createdItems = new ArrayList<>();
        for (MultipartFile imageFile : imageFiles) {
            validateImageFile(imageFile);
            StoredImagePaths storedImages = saveImageToStorage(imageFile);

            ObjectNode resultNode = createBaseResultNode(AiAnalysisStatus.PENDING, workerNote, null);
            resultNode.put("thumbnail_path", storedImages.thumbnailPath());
            resultNode.put("uploaded_by", "Worker");

            AiAnalysis analysis = AiAnalysis.builder()
                    .plantingBatch(batch)
                .imagePath(storedImages.originalPath())
                    .resultJson(writeJsonNode(resultNode))
                    .createdAt(LocalDateTime.now())
                    .build();

            AiAnalysis saved = aiAnalysisRepository.save(analysis);
            AiAnalysisDto dto = aiAnalysisMapper.toDto(saved);
            createdItems.add(dto);

            publishWorkflowEventSafely(
                    pBatchId,
                    "image_uploaded",
                    "Ảnh mới đã được gửi lên và đang chờ phân tích",
                    saved.getAnalysisId(),
                    dto
            );
        }

        return createdItems;
    }

    public AiAnalysisDto analyzeQueuedImage(Integer analysisId, String adminNote) {
        AiAnalysis analysis = aiAnalysisRepository.findById(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("AiAnalysis", analysisId));

        return analyzeAndPersist(analysis, adminNote);
    }

    public List<AiAnalysisDto> analyzeAllForBatch(Integer pBatchId, String adminNote) {
        List<AiAnalysis> analyses = aiAnalysisRepository.findByPlantingBatchPBatchIdOrderByCreatedAtAsc(pBatchId);
        List<AiAnalysisDto> results = new ArrayList<>();

        for (AiAnalysis analysis : analyses) {
            AiAnalysisStatus status = extractStatus(analysis.getResultJson());
            if (status == AiAnalysisStatus.PENDING || status == AiAnalysisStatus.FAILED) {
                results.add(analyzeAndPersist(analysis, adminNote));
            }
        }

        return results;
    }

    public AiAnalysisDto retryAnalysis(Integer analysisId, String adminNote) {
        return analyzeQueuedImage(analysisId, adminNote);
    }

    public AiAnalysisDto markAsFinalResult(Integer analysisId) {
        AiAnalysis selectedAnalysis = aiAnalysisRepository.findById(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("AiAnalysis", analysisId));

        AiAnalysisDto selectedDto = aiAnalysisMapper.toDto(selectedAnalysis);
        if (!AiAnalysisStatus.COMPLETED.name().equalsIgnoreCase(selectedDto.getWorkflowStatus())) {
            throw new AiServiceException("Chỉ có thể chọn ảnh đã phân tích thành công làm kết quả chính");
        }

        Integer pBatchId = selectedAnalysis.getPlantingBatch() != null
                ? selectedAnalysis.getPlantingBatch().getPBatchId()
                : null;

        if (pBatchId == null) {
            throw new AiServiceException("Không tìm thấy lô trồng cho bản ghi phân tích");
        }

        List<AiAnalysis> analyses = aiAnalysisRepository.findByPlantingBatchPBatchIdOrderByCreatedAtAsc(pBatchId);
        AiAnalysisDto finalDto = null;

        for (AiAnalysis analysis : analyses) {
            ObjectNode node = readResultNode(analysis.getResultJson());
            boolean shouldBeFinal = analysis.getAnalysisId().equals(analysisId);
            boolean isCurrentlyFinal = node.path("is_final_result").asBoolean(false);

            if (isCurrentlyFinal == shouldBeFinal) {
                if (shouldBeFinal) {
                    finalDto = aiAnalysisMapper.toDto(analysis);
                }
                continue;
            }

            node.put("is_final_result", shouldBeFinal);
            analysis.setResultJson(writeJsonNode(node));

            AiAnalysis saved = aiAnalysisRepository.save(analysis);
            AiAnalysisDto dto = aiAnalysisMapper.toDto(saved);

            if (shouldBeFinal) {
                finalDto = dto;
            }

            publishWorkflowEventSafely(
                    pBatchId,
                    "final_result_updated",
                    shouldBeFinal
                            ? "Đã chọn ảnh làm kết quả chính cho worker"
                            : "Đã bỏ chọn kết quả chính",
                    saved.getAnalysisId(),
                    dto
            );
        }

        return finalDto != null ? finalDto : selectedDto;
    }

    public AiAnalysisDto replaceImage(Integer analysisId, MultipartFile imageFile, String workerNote) {
        validateImageFile(imageFile);

        AiAnalysis analysis = aiAnalysisRepository.findById(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("AiAnalysis", analysisId));

        Integer pBatchId = analysis.getPlantingBatch() != null ? analysis.getPlantingBatch().getPBatchId() : null;
        String previousImagePath = analysis.getImagePath();
        String previousThumbnailPath = extractThumbnailPath(analysis.getResultJson());

        StoredImagePaths storedImages = saveImageToStorage(imageFile);

        ObjectNode node = readResultNode(analysis.getResultJson());
        node.put("workflow_status", AiAnalysisStatus.PENDING.name());
        node.put("is_final_result", false);
        node.put("error_message", "");
        node.put("thumbnail_path", storedImages.thumbnailPath());
        node.put("uploaded_by", "Worker");
        removeAnalysisResultFields(node);

        if (workerNote != null && !workerNote.isBlank()) {
            node.put("worker_note", workerNote.trim());
        }

        analysis.setImagePath(storedImages.originalPath());
        analysis.setResultJson(writeJsonNode(node));

        AiAnalysis saved = aiAnalysisRepository.save(analysis);
        AiAnalysisDto dto = aiAnalysisMapper.toDto(saved);
        deleteManagedImagesAfterCommit(previousImagePath, previousThumbnailPath);

        publishWorkflowEventSafely(
                pBatchId,
                "image_replaced",
                "Ảnh đã được cập nhật lại và chờ phân tích",
                analysisId,
                dto
        );

        return dto;
    }

    public SseEmitter subscribeToBatchEvents(Integer pBatchId) {
        return aiAnalysisSseService.subscribe(pBatchId);
    }

    public Resource loadStoredImage(String filename) {
        ensureStorageDirectoryExists();

        try {
            String safeFilename = Path.of(filename).getFileName().toString();
            Path target = resolveStoredImageTargetPath(safeFilename);

            return new UrlResource(target.toUri());
        } catch (IOException exception) {
            throw new AiServiceException("Không thể đọc ảnh đã lưu: " + exception.getMessage(), exception);
        }
    }

    /**
     * Phân tích ảnh lá cây chanh bằng AI
     * 1. Gửi ảnh đến Python API
     * 2. Nhận kết quả disease_class và confidence
     * 3. Mapping sang soil_condition và care_recommendation
     * 4. Lưu vào database
     * 5. Trả về AiAnalysisResponseDTO
     *
     * @throws ResourceNotFoundException if PlantingBatch not found
     * @throws AiServiceException if AI service fails
     */
    @Transactional
    public AiAnalysisResponseDTO analyzeLeafImage(Integer pBatchId, MultipartFile imageFile) {
        List<AiAnalysisDto> uploaded = enqueueWorkerImages(pBatchId, List.of(imageFile), null);
        if (uploaded.isEmpty() || uploaded.get(0).getAnalysisId() == null) {
            throw new AiServiceException("Không thể tạo yêu cầu phân tích ảnh");
        }

        AiAnalysisDto analyzed = analyzeQueuedImage(uploaded.get(0).getAnalysisId(), null);
        if (!AiAnalysisStatus.COMPLETED.name().equalsIgnoreCase(analyzed.getWorkflowStatus())) {
            throw new AiServiceException(
                    analyzed.getErrorMessage() != null
                            ? analyzed.getErrorMessage()
                            : "AI analysis failed"
            );
        }

        return AiAnalysisResponseDTO.builder()
                .diseaseClass(analyzed.getDiseaseClass())
                .confidence(analyzed.getConfidence())
                .soilCondition(analyzed.getSoilCondition())
                .careRecommendation(analyzed.getCareRecommendation())
                .build();
    }

    /**
     * Gọi Python API để phân tích ảnh sử dụng RestClient (Spring Boot 3+)
     */
    private String callPythonAiApi(byte[] fileBytes, String filename) throws Exception {
        try {
            // Tạo multipart body
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            });

            System.out.println("📡 Calling Python AI API: " + PYTHON_AI_URL);
            System.out.println("📁 File: " + filename + " (" + fileBytes.length + " bytes)");

            // Gửi request đến Python server sử dụng RestClient
            String response = restClient.post()
                    .uri(PYTHON_AI_URL)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            System.out.println("✅ Python AI Response: " + response);
            return response;

        } catch (Exception e) {
            System.err.println("❌ Failed to call Python AI API: " + e.getMessage());
            throw e;
        }
    }

    private AiAnalysisDto analyzeAndPersist(AiAnalysis analysis, String adminNote) {
        Integer pBatchId = analysis.getPlantingBatch() != null ? analysis.getPlantingBatch().getPBatchId() : null;

        ObjectNode processingNode = readResultNode(analysis.getResultJson());
        processingNode.put("workflow_status", AiAnalysisStatus.PROCESSING.name());
        processingNode.put("error_message", "");
        if (adminNote != null && !adminNote.isBlank()) {
            processingNode.put("admin_note", adminNote.trim());
        }

        analysis.setResultJson(writeJsonNode(processingNode));
        AiAnalysis processingSaved = aiAnalysisRepository.save(analysis);
        AiAnalysisDto processingDto = aiAnalysisMapper.toDto(processingSaved);

        publishWorkflowEventSafely(
            pBatchId,
            "analysis_processing",
            "Đang phân tích ảnh",
            processingSaved.getAnalysisId(),
            processingDto
        );

        try {
            byte[] imageBytes = readStoredImageBytes(processingSaved.getImagePath());
            byte[] resizedInput = resizeForModelInput(imageBytes);
            String filename = "analysis-" + processingSaved.getAnalysisId() + ".jpg";
            String pythonResponse = callPythonAiApi(resizedInput, filename);
            JsonNode aiResponse = objectMapper.readTree(pythonResponse);

            if (!aiResponse.has("status")) {
                throw new AiServiceException("AI response missing 'status' field");
            }

            String aiStatus = aiResponse.get("status").asText();
            if (!"success".equalsIgnoreCase(aiStatus)) {
                String errorMsg = aiResponse.has("message")
                        ? aiResponse.get("message").asText()
                        : "AI analysis returned error status";
                throw new AiServiceException(errorMsg);
            }

            if (!aiResponse.has("disease_class") || !aiResponse.has("confidence")) {
                throw new AiServiceException("AI response missing required fields (disease_class, confidence)");
            }

            String diseaseClass = aiResponse.get("disease_class").asText();
            double confidence = aiResponse.get("confidence").asDouble();
            DiseaseMapping mapping = DiseaseMapping.fromDiseaseClass(diseaseClass);

            ObjectNode completedNode = readResultNode(processingSaved.getResultJson());
            completedNode.put("workflow_status", AiAnalysisStatus.COMPLETED.name());
            completedNode.put("disease_class", diseaseClass);
            completedNode.put("confidence", confidence);
            completedNode.put("soil_condition", mapping.getSoilCondition());
            completedNode.put("care_recommendation", mapping.getCareRecommendation());
            completedNode.put("error_message", "");
            completedNode.put("analyzed_at", LocalDateTime.now().toString());
            if (!completedNode.has("is_final_result")) {
                completedNode.put("is_final_result", false);
            }

            processingSaved.setResultJson(writeJsonNode(completedNode));
            AiAnalysis completed = aiAnalysisRepository.save(processingSaved);
            AiAnalysisDto completedDto = aiAnalysisMapper.toDto(completed);

            publishWorkflowEventSafely(
                    pBatchId,
                    "analysis_completed",
                    "Phân tích ảnh thành công",
                    completed.getAnalysisId(),
                    completedDto
            );

            return completedDto;
        } catch (Exception exception) {
            ObjectNode failedNode = readResultNode(processingSaved.getResultJson());
            failedNode.put("workflow_status", AiAnalysisStatus.FAILED.name());
            failedNode.put("error_message", exception.getMessage());
            failedNode.put("analyzed_at", LocalDateTime.now().toString());

            processingSaved.setResultJson(writeJsonNode(failedNode));
            AiAnalysis failed = aiAnalysisRepository.save(processingSaved);
            AiAnalysisDto failedDto = aiAnalysisMapper.toDto(failed);

            publishWorkflowEventSafely(
                    pBatchId,
                    "analysis_failed",
                    "Phân tích ảnh thất bại",
                    failed.getAnalysisId(),
                    failedDto
            );

            return failedDto;
        }
    }

    private Path resolveStoredImageTargetPath(String safeFilename) {
        Path target = IMAGE_STORAGE_DIR.resolve(safeFilename).normalize();
        if (!target.startsWith(IMAGE_STORAGE_DIR)) {
            throw new ResourceNotFoundException("Image file", safeFilename);
        }

        if (Files.exists(target)) {
            return target;
        }

        if (safeFilename.endsWith("-thumb.jpg")) {
            String baseName = safeFilename.substring(0, safeFilename.length() - "-thumb.jpg".length());
            for (String extension : List.of(".jpg", ".jpeg", ".png", ".webp")) {
                Path fallbackTarget = IMAGE_STORAGE_DIR.resolve(baseName + extension).normalize();
                if (fallbackTarget.startsWith(IMAGE_STORAGE_DIR) && Files.exists(fallbackTarget)) {
                    return fallbackTarget;
                }
            }
        }

        throw new ResourceNotFoundException("Image file", safeFilename);
    }

    private void validateImageFile(MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new AiServiceException("Image file is required");
        }

        String contentType = imageFile.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new AiServiceException("File must be an image (JPG, PNG, WEBP)");
        }

        if (imageFile.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new AiServiceException("Image file exceeds 10MB");
        }
    }

    private StoredImagePaths saveImageToStorage(MultipartFile imageFile) {
        ensureStorageDirectoryExists();

        String extension = extractExtension(imageFile.getOriginalFilename());
        String baseName = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS").format(LocalDateTime.now())
                + "-"
                + java.util.UUID.randomUUID().toString().replace("-", "");

        String filename = baseName + extension;
        String thumbnailFilename = baseName + "-thumb.jpg";

        Path targetPath = IMAGE_STORAGE_DIR.resolve(filename).normalize();
        Path thumbnailPath = IMAGE_STORAGE_DIR.resolve(thumbnailFilename).normalize();
        if (!targetPath.startsWith(IMAGE_STORAGE_DIR)) {
            throw new AiServiceException("Invalid image path");
        }

        if (!thumbnailPath.startsWith(IMAGE_STORAGE_DIR)) {
            throw new AiServiceException("Invalid thumbnail path");
        }

        try {
            Files.copy(imageFile.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String originalApiPath = buildImageApiPath(filename);
            String thumbnailApiPath = originalApiPath;

            if (createThumbnailImage(targetPath, thumbnailPath)) {
                thumbnailApiPath = buildImageApiPath(thumbnailFilename);
            }

            return new StoredImagePaths(originalApiPath, thumbnailApiPath);
        } catch (IOException exception) {
            throw new AiServiceException("Failed to store image: " + exception.getMessage(), exception);
        }
    }

    private String buildImageApiPath(String filename) {
        return "/api/ai-analyses/images/" + filename;
    }

    private boolean createThumbnailImage(Path originalFilePath, Path thumbnailFilePath) {
        BufferedImage source = tryReadImage(originalFilePath);
        if (source == null) {
            return false;
        }

        BufferedImage resized = resizeWithinBounds(source, THUMBNAIL_MAX_WIDTH, THUMBNAIL_MAX_HEIGHT);
        try {
            return ImageIO.write(resized, "jpg", thumbnailFilePath.toFile());
        } catch (IOException ignored) {
            return false;
        }
    }

    private byte[] resizeForModelInput(byte[] rawBytes) {
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(rawBytes);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            BufferedImage source = ImageIO.read(inputStream);
            if (source == null) {
                return rawBytes;
            }

            BufferedImage normalized = resizeAndPad(source, MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT);
            if (!ImageIO.write(normalized, "jpg", outputStream)) {
                return rawBytes;
            }

            return outputStream.toByteArray();
        } catch (IOException ignored) {
            return rawBytes;
        }
    }

    private BufferedImage tryReadImage(Path imagePath) {
        try {
            return ImageIO.read(imagePath.toFile());
        } catch (IOException ignored) {
            return null;
        }
    }

    private BufferedImage resizeAndPad(BufferedImage source, int targetWidth, int targetHeight) {
        BufferedImage output = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = newImageGraphics(output);

        graphics.setColor(Color.BLACK);
        graphics.fillRect(0, 0, targetWidth, targetHeight);

        double widthRatio = (double) targetWidth / source.getWidth();
        double heightRatio = (double) targetHeight / source.getHeight();
        double ratio = Math.min(widthRatio, heightRatio);

        int scaledWidth = Math.max(1, (int) Math.round(source.getWidth() * ratio));
        int scaledHeight = Math.max(1, (int) Math.round(source.getHeight() * ratio));
        int offsetX = (targetWidth - scaledWidth) / 2;
        int offsetY = (targetHeight - scaledHeight) / 2;

        graphics.drawImage(source, offsetX, offsetY, scaledWidth, scaledHeight, null);
        graphics.dispose();
        return output;
    }

    private BufferedImage resizeWithinBounds(BufferedImage source, int maxWidth, int maxHeight) {
        if (source.getWidth() <= maxWidth && source.getHeight() <= maxHeight) {
            return source;
        }

        double widthRatio = (double) maxWidth / source.getWidth();
        double heightRatio = (double) maxHeight / source.getHeight();
        double ratio = Math.min(widthRatio, heightRatio);

        int targetWidth = Math.max(1, (int) Math.round(source.getWidth() * ratio));
        int targetHeight = Math.max(1, (int) Math.round(source.getHeight() * ratio));

        BufferedImage output = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = newImageGraphics(output);
        graphics.drawImage(source, 0, 0, targetWidth, targetHeight, null);
        graphics.dispose();
        return output;
    }

    private Graphics2D newImageGraphics(BufferedImage image) {
        Graphics2D graphics = image.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        return graphics;
    }

    private void ensureStorageDirectoryExists() {
        try {
            Files.createDirectories(IMAGE_STORAGE_DIR);
        } catch (IOException exception) {
            throw new AiServiceException("Cannot initialize image storage directory", exception);
        }
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return ".jpg";
        }

        int lastDot = originalFilename.lastIndexOf('.');
        if (lastDot < 0 || lastDot == originalFilename.length() - 1) {
            return ".jpg";
        }

        String extension = originalFilename.substring(lastDot).toLowerCase();
        return extension.length() > 10 ? ".jpg" : extension;
    }

    private byte[] readStoredImageBytes(String imagePath) {
        try {
            String filename = extractFilename(imagePath);
            Path target = IMAGE_STORAGE_DIR.resolve(filename).normalize();
            if (!target.startsWith(IMAGE_STORAGE_DIR) || !Files.exists(target)) {
                throw new ResourceNotFoundException("Image file", filename);
            }
            return Files.readAllBytes(target);
        } catch (IOException exception) {
            throw new AiServiceException("Cannot read stored image: " + exception.getMessage(), exception);
        }
    }

    private String extractFilename(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            throw new AiServiceException("Image path is empty");
        }

        int index = imagePath.lastIndexOf('/');
        if (index < 0) {
            return Path.of(imagePath).getFileName().toString();
        }

        return imagePath.substring(index + 1);
    }

    private ObjectNode readResultNode(String resultJson) {
        if (resultJson == null || resultJson.isBlank()) {
            return objectMapper.createObjectNode();
        }

        try {
            JsonNode node = objectMapper.readTree(resultJson);
            if (node != null && node.isObject()) {
                return (ObjectNode) node;
            }
        } catch (IOException ignored) {
            // Fallback to an empty object node when legacy JSON is malformed.
        }

        return objectMapper.createObjectNode();
    }

    private String writeJsonNode(ObjectNode node) {
        try {
            return objectMapper.writeValueAsString(node);
        } catch (IOException exception) {
            throw new AiServiceException("Cannot serialize analysis result JSON", exception);
        }
    }

    private ObjectNode createBaseResultNode(AiAnalysisStatus status, String workerNote, String adminNote) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("workflow_status", status.name());
        node.put("is_final_result", false);
        node.put("error_message", "");
        node.put("uploaded_by", "Worker");

        if (workerNote != null && !workerNote.isBlank()) {
            node.put("worker_note", workerNote.trim());
        }

        if (adminNote != null && !adminNote.isBlank()) {
            node.put("admin_note", adminNote.trim());
        }

        return node;
    }

    private AiAnalysisStatus extractStatus(String resultJson) {
        ObjectNode node = readResultNode(resultJson);
        String raw = node.path("workflow_status").asText("").trim();
        if (raw.isBlank()) {
            return node.hasNonNull("disease_class") ? AiAnalysisStatus.COMPLETED : AiAnalysisStatus.PENDING;
        }

        try {
            return AiAnalysisStatus.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return AiAnalysisStatus.PENDING;
        }
    }

    private void removeAnalysisResultFields(ObjectNode node) {
        Iterator<String> fields = List.of(
                "disease_class",
                "confidence",
                "soil_condition",
                "care_recommendation",
                "analyzed_at"
        ).iterator();

        while (fields.hasNext()) {
            node.remove(fields.next());
        }
    }

    private String extractThumbnailPath(String resultJson) {
        ObjectNode node = readResultNode(resultJson);
        String thumbnailPath = node.path("thumbnail_path").asText("").trim();
        return thumbnailPath.isBlank() ? null : thumbnailPath;
    }

    private boolean shouldUsePagination(Integer page, Integer size) {
        return page != null || size != null;
    }

    private Pageable buildPageable(Integer page, Integer size, boolean oldestFirst) {
        int safePage = page != null && page >= 0 ? page : 0;
        int safeSize = size != null && size > 0 ? Math.min(size, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
        return PageRequest.of(safePage, safeSize, buildSort(oldestFirst));
    }

    private Sort buildSort(boolean oldestFirst) {
        Sort.Order createdAtOrder = oldestFirst
                ? Sort.Order.asc("createdAt")
                : Sort.Order.desc("createdAt");
        Sort.Order idOrder = oldestFirst
                ? Sort.Order.asc("analysisId")
                : Sort.Order.desc("analysisId");

        return Sort.by(createdAtOrder, idOrder);
    }

    private void publishWorkflowEventSafely(
            Integer pBatchId,
            String eventType,
            String message,
            Integer analysisId,
            AiAnalysisDto item) {
        if (pBatchId == null) {
            return;
        }

        try {
            aiAnalysisSseService.publish(pBatchId, eventType, message, analysisId, item);
        } catch (RuntimeException ignored) {
            // Keep API operations stable even if a client disconnected mid-stream.
        }
    }

    private void deleteManagedImagesAfterCommit(String... imagePaths) {
        List<String> pathsToDelete = Arrays.stream(imagePaths)
                .filter(path -> path != null && !path.isBlank())
                .distinct()
                .toList();

        if (pathsToDelete.isEmpty()) {
            return;
        }

        Runnable cleanupTask = () -> pathsToDelete.forEach(this::deleteStoredImageIfManaged);
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            cleanupTask.run();
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                cleanupTask.run();
            }
        });
    }

    private void deleteStoredImageIfManaged(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            return;
        }

        try {
            String filename = extractFilename(imagePath);
            Path target = IMAGE_STORAGE_DIR.resolve(filename).normalize();
            if (target.startsWith(IMAGE_STORAGE_DIR) && Files.exists(target)) {
                Files.delete(target);
            }
        } catch (IOException | RuntimeException ignored) {
            // Keep delete non-blocking; DB cleanup should continue even if file cleanup fails.
        }
    }
}
