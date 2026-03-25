package com.smartfarm.api.service;

import com.smartfarm.api.dto.AiAnalysisDto;
import com.smartfarm.api.entity.AiAnalysis;
import com.smartfarm.api.mapper.AiAnalysisMapper;
import com.smartfarm.api.repository.AiAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AiAnalysisService {

    private final AiAnalysisRepository aiAnalysisRepository;
    private final AiAnalysisMapper aiAnalysisMapper;

    @Autowired
    public AiAnalysisService(AiAnalysisRepository aiAnalysisRepository, AiAnalysisMapper aiAnalysisMapper) {
        this.aiAnalysisRepository = aiAnalysisRepository;
        this.aiAnalysisMapper = aiAnalysisMapper;
    }

    public List<AiAnalysisDto> findAll() {
        return aiAnalysisRepository.findAll().stream().map(aiAnalysisMapper::toDto).collect(Collectors.toList());
    }

    public List<AiAnalysisDto> findByBatchId(Integer pBatchId) {
        return aiAnalysisRepository.findByPlantingBatchPBatchId(pBatchId).stream().map(aiAnalysisMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<AiAnalysisDto> findById(Integer id) {
        return aiAnalysisRepository.findById(id).map(aiAnalysisMapper::toDto);
    }

    public AiAnalysisDto create(AiAnalysisDto dto) {
        AiAnalysis entity = aiAnalysisMapper.toEntity(dto);
        return aiAnalysisMapper.toDto(aiAnalysisRepository.save(entity));
    }

    public Optional<AiAnalysisDto> update(Integer id, AiAnalysisDto dto) {
        if (!aiAnalysisRepository.existsById(id))
            return Optional.empty();
        AiAnalysis entity = aiAnalysisMapper.toEntity(dto);
        entity.setAnalysisId(id);
        return Optional.of(aiAnalysisMapper.toDto(aiAnalysisRepository.save(entity)));
    }

    public boolean deleteById(Integer id) {
        if (!aiAnalysisRepository.existsById(id))
            return false;
        aiAnalysisRepository.deleteById(id);
        return true;
    }
}
