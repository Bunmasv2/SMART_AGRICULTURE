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

    public List<StageDto> findByProcessId(Integer processId) {
        return stageRepository.findByProcessProcessId(processId).stream().map(stageMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<StageSimpleDto> findSimpleByProcessId(Integer processId) {
        return stageRepository.findByProcessProcessId(processId).stream().map(stageMapper::toSimpleDto)
                .collect(Collectors.toList());
    }

    public Optional<StageDto> findById(Integer id) {
        return stageRepository.findById(id).map(stageMapper::toDto);
    }

    public StageDto create(StageDto dto) {
        validateStageDays(dto.getProcessId(), dto.getStartDay(), dto.getEndDay(), null);
        Stage entity = stageMapper.toEntity(dto);
        return stageMapper.toDto(stageRepository.save(entity));
    }

    public Optional<StageDto> update(Integer id, StageDto dto) {
        if (!stageRepository.existsById(id))
            return Optional.empty();
        validateStageDays(dto.getProcessId(), dto.getStartDay(), dto.getEndDay(), id);
        Stage entity = stageMapper.toEntity(dto);
        entity.setStageId(id);
        return Optional.of(stageMapper.toDto(stageRepository.save(entity)));
    }

    public boolean deleteById(Integer id) {
        if (!stageRepository.existsById(id))
            return false;
        stageRepository.deleteById(id);
        return true;
    }

    private void validateStageDays(Integer processId, Integer startDay, Integer endDay, Integer excludeId) {
        // 1. startDay phải < endDay
        if (startDay >= endDay) {
            throw new IllegalArgumentException("startDay phải nhỏ hơn endDay");
        }

        // 2. Lấy tất cả stage của process, bỏ qua stage đang update
        List<Stage> existingStages = stageRepository.findByProcessProcessId(processId).stream()
                .filter(s -> !s.getStageId().equals(excludeId))
                .toList();

        // 3. Kiểm tra overlap
        for (Stage existing : existingStages) {
            boolean overlaps = startDay <= existing.getEndDay() && endDay >= existing.getStartDay();
            if (overlaps) {
                throw new IllegalArgumentException(
                        String.format("Khoảng ngày [%d-%d] bị trùng với giai đoạn '%s' [%d-%d]",
                                startDay, endDay,
                                existing.getStageName(),
                                existing.getStartDay(), existing.getEndDay()));
            }
        }
    }
}
