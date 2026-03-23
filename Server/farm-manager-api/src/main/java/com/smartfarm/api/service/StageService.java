package com.smartfarm.api.service;

import com.smartfarm.api.dto.StageDto;
import com.smartfarm.api.dto.StageSimpleDto;
import com.smartfarm.api.entity.Stage;
import com.smartfarm.api.mapper.StageMapper;
import com.smartfarm.api.repository.StageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class StageService {

    private final StageRepository stageRepository;
    private final StageMapper stageMapper;

    @Autowired
    public StageService(StageRepository stageRepository, StageMapper stageMapper) {
        this.stageRepository = stageRepository;
        this.stageMapper = stageMapper;
    }

    public List<StageDto> findAll() {
        return stageRepository.findAll().stream().map(stageMapper::toDto).collect(Collectors.toList());
    }

    public List<StageDto> findByProcessId(Long processId) {
        return stageRepository.findByProcessProcessId(processId).stream().map(stageMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<StageSimpleDto> findSimpleByProcessId(Long processId) {
        return stageRepository.findByProcessProcessId(processId).stream().map(stageMapper::toSimpleDto)
                .collect(Collectors.toList());
    }

    public Optional<StageDto> findById(Long id) {
        return stageRepository.findById(id).map(stageMapper::toDto);
    }

    public StageDto create(StageDto dto) {
        Stage entity = stageMapper.toEntity(dto);
        return stageMapper.toDto(stageRepository.save(entity));
    }

    public Optional<StageDto> update(Long id, StageDto dto) {
        if (!stageRepository.existsById(id))
            return Optional.empty();
        Stage entity = stageMapper.toEntity(dto);
        entity.setStageId(id);
        return Optional.of(stageMapper.toDto(stageRepository.save(entity)));
    }

    public boolean deleteById(Long id) {
        if (!stageRepository.existsById(id))
            return false;
        stageRepository.deleteById(id);
        return true;
    }
}
