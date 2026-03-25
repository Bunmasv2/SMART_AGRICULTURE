package com.smartfarm.api.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfarm.api.dto.AiAnalysisDto;
import com.smartfarm.api.dto.AiAnalysisResponseDTO;
import com.smartfarm.api.entity.AiAnalysis;
import com.smartfarm.api.entity.PlantingBatch;
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

    private static final String PYTHON_AI_URL = "http://localhost:8000/api/predict-leaf";

    @Autowired
    public AiAnalysisService(
            AiAnalysisRepository aiAnalysisRepository,
            AiAnalysisMapper aiAnalysisMapper,
            PlantingBatchRepository plantingBatchRepository,
            RestClient restClient,
            ObjectMapper objectMapper) {
        this.aiAnalysisRepository = aiAnalysisRepository;
        this.aiAnalysisMapper = aiAnalysisMapper;
        this.plantingBatchRepository = plantingBatchRepository;
        this.restClient = restClient;
        this.objectMapper = objectMapper;
    }

    public List<AiAnalysisDto> findAll() {
        return aiAnalysisRepository.findAll().stream().map(aiAnalysisMapper::toDto).collect(Collectors.toList());
    }

    public List<AiAnalysisDto> findByBatchId(Integer pBatchId) {
        return aiAnalysisRepository.findByPlantingBatchPBatchId(pBatchId).stream().map(aiAnalysisMapper::toDto).collect(Collectors.toList());
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
        if (!aiAnalysisRepository.existsById(id)) return false;
        aiAnalysisRepository.deleteById(id);
        return true;
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
        try {
            // Kiểm tra PlantingBatch có tồn tại không
            PlantingBatch batch = plantingBatchRepository.findById(pBatchId)
                    .orElseThrow(() -> new ResourceNotFoundException("PlantingBatch", pBatchId));

            // 1. Gọi Python API để phân tích ảnh
            String pythonResponse;
            try {
                pythonResponse = callPythonAiApi(imageFile);
            } catch (Exception e) {
                throw new AiServiceException("Failed to connect to AI service: " + e.getMessage(), e);
            }

            // 2. Parse JSON response
            JsonNode jsonNode;
            try {
                jsonNode = objectMapper.readTree(pythonResponse);
            } catch (Exception e) {
                throw new AiServiceException("Failed to parse AI response: " + e.getMessage(), e);
            }

            // Check if response has status field
            if (!jsonNode.has("status")) {
                throw new AiServiceException("AI response missing 'status' field");
            }

            String status = jsonNode.get("status").asText();

            if (!"success".equals(status)) {
                // Get error message from Python AI
                String errorMsg = jsonNode.has("message")
                    ? jsonNode.get("message").asText()
                    : "AI analysis returned error status";
                throw new AiServiceException("AI analysis failed: " + errorMsg);
            }

            // Validate required fields
            if (!jsonNode.has("disease_class") || !jsonNode.has("confidence")) {
                throw new AiServiceException("AI response missing required fields (disease_class, confidence)");
            }

            String diseaseClass = jsonNode.get("disease_class").asText();
            Double confidence = jsonNode.get("confidence").asDouble();

            // 3. Suy luận thông tin đất và gợi ý từ Enum
            DiseaseMapping mapping = DiseaseMapping.fromDiseaseClass(diseaseClass);

            // 4. Tạo JSON kết quả để lưu vào database
            String resultJson = String.format(
                    "{\"disease_class\":\"%s\",\"confidence\":%.4f,\"soil_condition\":\"%s\",\"care_recommendation\":\"%s\"}",
                    diseaseClass, confidence, mapping.getSoilCondition(), mapping.getCareRecommendation()
            );

            // 5. Lưu vào database
            AiAnalysis analysis = AiAnalysis.builder()
                    .plantingBatch(batch)
                    .imagePath("/uploads/ai-analysis/" + imageFile.getOriginalFilename()) // Đường dẫn giả lập
                    .resultJson(resultJson)
                    .createdAt(LocalDateTime.now())
                    .build();

            aiAnalysisRepository.save(analysis);

            // 6. Trả về DTO cho React
            return AiAnalysisResponseDTO.builder()
                    .diseaseClass(diseaseClass)
                    .confidence(confidence)
                    .soilCondition(mapping.getSoilCondition())
                    .careRecommendation(mapping.getCareRecommendation())
                    .build();

        } catch (ResourceNotFoundException | AiServiceException e) {
            // Re-throw custom exceptions as-is
            throw e;
        } catch (Exception e) {
            // Wrap unexpected errors
            throw new AiServiceException("Unexpected error analyzing image: " + e.getMessage(), e);
        }
    }

    /**
     * Gọi Python API để phân tích ảnh sử dụng RestClient (Spring Boot 3+)
     */
    private String callPythonAiApi(MultipartFile file) throws Exception {
        try {
            // Tạo multipart body
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            System.out.println("📡 Calling Python AI API: " + PYTHON_AI_URL);
            System.out.println("📁 File: " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)");

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
}
