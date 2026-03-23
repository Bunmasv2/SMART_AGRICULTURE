package com.smartfarm.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfarm.api.dto.AiAnalysisDto;
import com.smartfarm.api.dto.AiAnalysisResponseDTO;
import com.smartfarm.api.entity.AiAnalysis;
import com.smartfarm.api.entity.PlantingBatch;
import com.smartfarm.api.enums.DiseaseMapping;
import com.smartfarm.api.mapper.AiAnalysisMapper;
import com.smartfarm.api.repository.AiAnalysisRepository;
import com.smartfarm.api.repository.PlantingBatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    public Optional<AiAnalysisDto> findById(Long id) {
        return aiAnalysisRepository.findById(id).map(aiAnalysisMapper::toDto);
    }

    public AiAnalysisDto create(AiAnalysisDto dto) {
        AiAnalysis entity = aiAnalysisMapper.toEntity(dto);
        return aiAnalysisMapper.toDto(aiAnalysisRepository.save(entity));
    }

    public Optional<AiAnalysisDto> update(Long id, AiAnalysisDto dto) {
        if (!aiAnalysisRepository.existsById(id)) return Optional.empty();
        AiAnalysis entity = aiAnalysisMapper.toEntity(dto);
        entity.setAnalysisId(id);
        return Optional.of(aiAnalysisMapper.toDto(aiAnalysisRepository.save(entity)));
    }

    public boolean deleteById(Long id) {
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
     */
    @Transactional
    public AiAnalysisResponseDTO analyzeLeafImage(Integer pBatchId, MultipartFile imageFile) {
        try {
            // Kiểm tra PlantingBatch có tồn tại không
            PlantingBatch batch = plantingBatchRepository.findById(pBatchId)
                    .orElseThrow(() -> new RuntimeException("PlantingBatch not found with id: " + pBatchId));

            // 1. Gọi Python API để phân tích ảnh
            String pythonResponse = callPythonAiApi(imageFile);

            // 2. Parse JSON response
            JsonNode jsonNode = objectMapper.readTree(pythonResponse);
            String status = jsonNode.get("status").asText();

            if (!"success".equals(status)) {
                throw new RuntimeException("AI analysis failed: " + jsonNode.get("message").asText());
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

        } catch (Exception e) {
            throw new RuntimeException("Error analyzing image: " + e.getMessage(), e);
        }
    }

    /**
     * Gọi Python API để phân tích ảnh sử dụng RestClient (Spring Boot 3+)
     */
    private String callPythonAiApi(MultipartFile file) throws Exception {
        // Tạo multipart body
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });

        // Gửi request đến Python server sử dụng RestClient
        String response = restClient.post()
                .uri(PYTHON_AI_URL)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(String.class);

        return response;
    }
}
