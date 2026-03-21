package com.smartfarm.api.service;

import com.smartfarm.api.dto.InventoryItemDto;
import com.smartfarm.api.entity.InventoryItem;
import com.smartfarm.api.mapper.InventoryItemMapper;
import com.smartfarm.api.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryItemMapper inventoryItemMapper;

    @Autowired
    public InventoryItemService(InventoryItemRepository inventoryItemRepository, InventoryItemMapper inventoryItemMapper) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.inventoryItemMapper = inventoryItemMapper;
    }

    public List<InventoryItemDto> findAll() {
        return inventoryItemRepository.findAll().stream().map(inventoryItemMapper::toDto).collect(Collectors.toList());
    }

    public List<InventoryItemDto> findByCategory(String category) {
        return inventoryItemRepository.findByCategory(category).stream().map(inventoryItemMapper::toDto).collect(Collectors.toList());
    }

    public Optional<InventoryItemDto> findById(Long id) {
        return inventoryItemRepository.findById(id).map(inventoryItemMapper::toDto);
    }

    public InventoryItemDto create(InventoryItemDto dto) {
        InventoryItem entity = inventoryItemMapper.toEntity(dto);
        return inventoryItemMapper.toDto(inventoryItemRepository.save(entity));
    }

    public Optional<InventoryItemDto> update(Long id, InventoryItemDto dto) {
        if (!inventoryItemRepository.existsById(id)) return Optional.empty();
        InventoryItem entity = inventoryItemMapper.toEntity(dto);
        entity.setItemId(id);
        return Optional.of(inventoryItemMapper.toDto(inventoryItemRepository.save(entity)));
    }

    public boolean deleteById(Long id) {
        if (!inventoryItemRepository.existsById(id)) return false;
        inventoryItemRepository.deleteById(id);
        return true;
    }
}
