package com.smartfarm.api.service;

import com.smartfarm.api.dto.PlantingBatchDto;
import com.smartfarm.api.entity.PlantingBatch;
import com.smartfarm.api.mapper.PlantingBatchMapper;
import com.smartfarm.api.repository.PlantingBatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlantingBatchService {

    private final PlantingBatchRepository plantingBatchRepository;
    private final PlantingBatchMapper plantingBatchMapper;

    @Autowired
    public PlantingBatchService(PlantingBatchRepository plantingBatchRepository, PlantingBatchMapper plantingBatchMapper) {
        this.plantingBatchRepository = plantingBatchRepository;
        this.plantingBatchMapper = plantingBatchMapper;
    }

    public List<PlantingBatchDto> findAll() {
        return plantingBatchRepository.findAll().stream().map(plantingBatchMapper::toDto).collect(Collectors.toList());
    }

    public List<PlantingBatchDto> findByStatus(String status) {
        return plantingBatchRepository.findByStatus(status).stream().map(plantingBatchMapper::toDto).collect(Collectors.toList());
    }

    public Optional<PlantingBatchDto> findById(Integer id) {
        return plantingBatchRepository.findById(id).map(plantingBatchMapper::toDto);
    }

    public PlantingBatchDto create(PlantingBatchDto dto) {
        PlantingBatch entity = plantingBatchMapper.toEntity(dto);
        return plantingBatchMapper.toDto(plantingBatchRepository.save(entity));
    }

    public Optional<PlantingBatchDto> update(Integer id, PlantingBatchDto dto) {
        if (!plantingBatchRepository.existsById(id)) return Optional.empty();
        PlantingBatch entity = plantingBatchMapper.toEntity(dto);
        entity.setPBatchId(id);
        return Optional.of(plantingBatchMapper.toDto(plantingBatchRepository.save(entity)));
    }

    public boolean deleteById(Integer id) {
        if (!plantingBatchRepository.existsById(id)) return false;
        plantingBatchRepository.deleteById(id);
        return true;
    }
}
