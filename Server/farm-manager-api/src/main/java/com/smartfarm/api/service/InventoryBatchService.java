package com.smartfarm.api.service;

import com.smartfarm.api.dto.InventoryBatchDto;
import com.smartfarm.api.entity.InventoryBatch;
import com.smartfarm.api.mapper.InventoryBatchMapper;
import com.smartfarm.api.repository.InventoryBatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryBatchService {

    private final InventoryBatchRepository inventoryBatchRepository;
    private final InventoryBatchMapper inventoryBatchMapper;

    @Autowired
    public InventoryBatchService(InventoryBatchRepository inventoryBatchRepository,
            InventoryBatchMapper inventoryBatchMapper) {
        this.inventoryBatchRepository = inventoryBatchRepository;
        this.inventoryBatchMapper = inventoryBatchMapper;
    }

    public List<InventoryBatchDto> findAll() {
        return inventoryBatchRepository.findAll().stream().map(inventoryBatchMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<InventoryBatchDto> findByItemId(Integer itemId) {
        return inventoryBatchRepository.findByItemItemId(itemId).stream().map(inventoryBatchMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<InventoryBatchDto> findByCategory(String category) {
        return inventoryBatchRepository.findByItemCategory(category).stream().map(inventoryBatchMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<InventoryBatchDto> findById(Integer id) {
        return inventoryBatchRepository.findById(id).map(inventoryBatchMapper::toDto);
    }

    public InventoryBatchDto create(InventoryBatchDto dto) {
        InventoryBatch entity = inventoryBatchMapper.toEntity(dto);
        return inventoryBatchMapper.toDto(inventoryBatchRepository.save(entity));
    }

    public Optional<InventoryBatchDto> update(Integer id, InventoryBatchDto dto) {
        if (!inventoryBatchRepository.existsById(id))
            return Optional.empty();
        InventoryBatch entity = inventoryBatchMapper.toEntity(dto);
        entity.setBatchInvId(id);
        return Optional.of(inventoryBatchMapper.toDto(inventoryBatchRepository.save(entity)));
    }

    public boolean deleteById(Integer id) {
        if (!inventoryBatchRepository.existsById(id))
            return false;
        inventoryBatchRepository.deleteById(id);
        return true;
    }
}
