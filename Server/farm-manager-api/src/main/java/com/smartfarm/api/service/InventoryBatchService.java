package com.smartfarm.api.service;

import com.smartfarm.api.dto.InventoryBatchDto;
import com.smartfarm.api.entity.InventoryBatch;
import com.smartfarm.api.entity.InventoryItem;
import com.smartfarm.api.entity.User;
import com.smartfarm.api.mapper.InventoryBatchMapper;
import com.smartfarm.api.repository.CropRepository;
import com.smartfarm.api.repository.InventoryBatchRepository;
import com.smartfarm.api.repository.InventoryItemRepository;
import com.smartfarm.api.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class InventoryBatchService {

    private final InventoryBatchRepository inventoryBatchRepository;
    private final InventoryBatchMapper inventoryBatchMapper;
    private final InventoryItemRepository inventoryItemRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final CropRepository cropRepository;

    @Autowired
    public InventoryBatchService(InventoryBatchRepository inventoryBatchRepository, 
                                InventoryBatchMapper inventoryBatchMapper,
                                InventoryItemRepository inventoryItemRepository,
                                EmailService emailService,
                                UserRepository userRepository,
                                CropRepository cropRepository) {
        this.inventoryBatchRepository = inventoryBatchRepository;
        this.inventoryBatchMapper = inventoryBatchMapper;
        this.inventoryItemRepository = inventoryItemRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.cropRepository = cropRepository;
    }

    private void checkAndSendImmediateAlert(InventoryBatch batch) {
        // Reload batch to ensure all relations are populated
        InventoryBatch fullBatch = inventoryBatchRepository.findById(batch.getBatchInvId()).orElse(batch);
        
        if (fullBatch.getItem() == null) {
            log.warn("Không thể gửi cảnh báo vì Item là null cho batch ID: {}", fullBatch.getBatchInvId());
            return;
        }

        LocalDate today = LocalDate.now();
        boolean isExpired = fullBatch.getExpiryDate() != null && fullBatch.getExpiryDate().isBefore(today);
        boolean isNearExpiry = fullBatch.getExpiryDate() != null && 
                               !fullBatch.getExpiryDate().isBefore(today) && 
                               fullBatch.getExpiryDate().isBefore(today.plusDays(30));
        
        // Calculate total quantity for this item
        Double totalQuantity = inventoryBatchRepository.findByItemItemId(fullBatch.getItem().getItemId())
                .stream().mapToDouble(InventoryBatch::getQuantity).sum();
        boolean isLowStock = fullBatch.getItem().getMinThreshold() != null && 
                            fullBatch.getItem().getMinThreshold() > 0 && 
                            totalQuantity <= fullBatch.getItem().getMinThreshold();

        if (isExpired || isNearExpiry || isLowStock) {
            List<User> recipients = userRepository.findAll().stream()
                    .filter(u -> u.isVerified() && u.getEmail() != null)
                    .collect(Collectors.toList());

            for (User user : recipients) {
                try {
                    emailService.sendInventoryAlertEmail(
                        user.getEmail(), 
                        isExpired ? Collections.singletonList(fullBatch) : Collections.emptyList(),
                        isNearExpiry ? Collections.singletonList(fullBatch) : Collections.emptyList(),
                        isLowStock ? Collections.singletonList(fullBatch.getItem()) : Collections.emptyList()
                    );
                } catch (Exception e) {
                    log.error("Failed to send real-time alert: {}", e.getMessage());
                }
            }
        }
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
        List<InventoryBatch> batches = inventoryBatchRepository.findByItemCategory(category);
        batches.forEach(batch -> {
            if (batch.getItem() != null && (batch.getItem().getMinThreshold() == null || batch.getItem().getMinThreshold() <= 0)) {
                batch.getItem().setMinThreshold(10.0);
                inventoryItemRepository.save(batch.getItem());
            }
        });
        return batches.stream().map(inventoryBatchMapper::toDto).collect(Collectors.toList());
    }

    public Optional<InventoryBatchDto> findById(Integer id) {
        return inventoryBatchRepository.findById(id).map(inventoryBatchMapper::toDto);
    }

    public InventoryBatchDto create(InventoryBatchDto dto) {
        InventoryBatch entity = inventoryBatchMapper.toEntity(dto);
        InventoryBatch saved = inventoryBatchRepository.save(entity);
        
        // Update item details if provided
        if (dto.getItemId() != null) {
            inventoryItemRepository.findById(dto.getItemId()).ifPresent(item -> {
                if (dto.getMinThreshold() != null) {
                    item.setMinThreshold(dto.getMinThreshold());
                }
                if (dto.getItemName() != null) {
                    item.setItemName(dto.getItemName());
                }
                if (dto.getCropId() != null) {
                    cropRepository.findById(dto.getCropId()).ifPresent(item::setCrop);
                }
                inventoryItemRepository.save(item);
            });
        }
        
        checkAndSendImmediateAlert(saved);
        
        return inventoryBatchMapper.toDto(saved);
    }

    public Optional<InventoryBatchDto> update(Integer id, InventoryBatchDto dto) {
        return inventoryBatchRepository.findById(id).map(entity -> {
            InventoryBatch updatedEntity = inventoryBatchMapper.toEntity(dto);
            updatedEntity.setBatchInvId(id);
            InventoryBatch saved = inventoryBatchRepository.save(updatedEntity);
            
            // Update item details if provided
            if (dto.getItemId() != null) {
                inventoryItemRepository.findById(dto.getItemId()).ifPresent(item -> {
                    if (dto.getMinThreshold() != null) {
                        item.setMinThreshold(dto.getMinThreshold());
                    }
                    if (dto.getItemName() != null) {
                        item.setItemName(dto.getItemName());
                    }
                    if (dto.getCropId() != null) {
                        cropRepository.findById(dto.getCropId()).ifPresent(item::setCrop);
                    }
                    inventoryItemRepository.save(item);
                });
            }
            
            checkAndSendImmediateAlert(saved);
            
            return inventoryBatchMapper.toDto(saved);
        });
    }

    public boolean deleteById(Integer id) {
        if (!inventoryBatchRepository.existsById(id))
            return false;
        inventoryBatchRepository.deleteById(id);
        return true;
    }
}