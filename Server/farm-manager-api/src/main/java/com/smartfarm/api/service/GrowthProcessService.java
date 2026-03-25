package com.smartfarm.api.service;

import com.smartfarm.api.dto.GrowthProcessDetailDto;
import com.smartfarm.api.dto.GrowthProcessDto;
import com.smartfarm.api.entity.GrowthProcess;
import com.smartfarm.api.mapper.GrowthProcessMapper;
import com.smartfarm.api.repository.GrowthProcessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class GrowthProcessService {

    private final GrowthProcessRepository growthProcessRepository;
    private final GrowthProcessMapper growthProcessMapper;

    @Autowired
    public GrowthProcessService(GrowthProcessRepository growthProcessRepository,
            GrowthProcessMapper growthProcessMapper) {
        this.growthProcessRepository = growthProcessRepository;
        this.growthProcessMapper = growthProcessMapper;
    }

    public List<GrowthProcessDto> findAll() {
        return growthProcessRepository.findAll().stream().map(growthProcessMapper::toDto).collect(Collectors.toList());
    }

    public List<GrowthProcessDto> findByCropId(Integer cropId) {
        return growthProcessRepository.findByCropCropId(cropId).stream().map(growthProcessMapper::toDto).collect(Collectors.toList());
    }

    public Optional<GrowthProcessDto> findById(Integer id) {
        return growthProcessRepository.findById(id).map(growthProcessMapper::toDto);
    }

    public GrowthProcessDto create(GrowthProcessDto dto) {
        GrowthProcess entity = growthProcessMapper.toEntity(dto);
        return growthProcessMapper.toDto(growthProcessRepository.save(entity));
    }

    public Optional<GrowthProcessDto> update(Integer id, GrowthProcessDto dto) {
        if (!growthProcessRepository.existsById(id)) return Optional.empty();
        GrowthProcess entity = growthProcessMapper.toEntity(dto);
        entity.setProcessId(id);
        return Optional.of(growthProcessMapper.toDto(growthProcessRepository.save(entity)));
    }

    public boolean deleteById(Integer id) {
        if (!growthProcessRepository.existsById(id)) return false;
        growthProcessRepository.deleteById(id);
        return true;
    }

    public int deleteByIds(List<Integer> ids) {
        List<GrowthProcess> processes = growthProcessRepository.findAllById(ids);

        if (processes.isEmpty()) {
            throw new RuntimeException("No GrowthProcess found with provided IDs");
        }

        growthProcessRepository.deleteAll(processes);
        return processes.size();
    }

    public Optional<GrowthProcessDetailDto> findDetailById(Integer id) {
        return growthProcessRepository.findById(id).map(growthProcessMapper::toDetailDto);
    }
}
