package com.smartfarm.api.service;

import com.smartfarm.api.dto.CropDto;
import com.smartfarm.api.entity.Crop;
import com.smartfarm.api.mapper.CropMapper;
import com.smartfarm.api.repository.CropRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CropService {

    private final CropRepository cropRepository;
    private final CropMapper cropMapper;

    @Autowired
    public CropService(CropRepository cropRepository, CropMapper cropMapper) {
        this.cropRepository = cropRepository;
        this.cropMapper = cropMapper;
    }

    public List<CropDto> findAll() {
        return cropRepository.findAll().stream().map(cropMapper::toDto).collect(Collectors.toList());
    }

    public Optional<CropDto> findById(Long id) {
        return cropRepository.findById(id).map(cropMapper::toDto);
    }

    public CropDto create(CropDto dto) {
        Crop entity = cropMapper.toEntity(dto);
        return cropMapper.toDto(cropRepository.save(entity));
    }

    public Optional<CropDto> update(Long id, CropDto dto) {
        if (!cropRepository.existsById(id)) return Optional.empty();
        Crop entity = cropMapper.toEntity(dto);
        entity.setCropId(id);
        return Optional.of(cropMapper.toDto(cropRepository.save(entity)));
    }

    public boolean deleteById(Long id) {
        if (!cropRepository.existsById(id)) return false;
        cropRepository.deleteById(id);
        return true;
    }
}
