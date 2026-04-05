package com.smartfarm.api.service;

import com.smartfarm.api.dto.CreateFertilizerRequest;
import com.smartfarm.api.dto.InventoryItemDto;
import com.smartfarm.api.entity.Crop;
import com.smartfarm.api.entity.InventoryBatch;
import com.smartfarm.api.entity.InventoryItem;
import com.smartfarm.api.mapper.InventoryItemMapper;
import com.smartfarm.api.repository.InventoryBatchRepository;
import com.smartfarm.api.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale.Category;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;

@Service
@Transactional
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryItemMapper inventoryItemMapper;
    private final InventoryBatchRepository batchRepo;

    @Autowired
    public InventoryItemService(
            InventoryItemRepository inventoryItemRepository,
            InventoryItemMapper inventoryItemMapper,
            InventoryBatchRepository batchRepo) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.inventoryItemMapper = inventoryItemMapper;
        this.batchRepo = batchRepo;
    }

    public List<InventoryItemDto> findAll() {
        return inventoryItemRepository.findAll()
                .stream()
                .map(inventoryItemMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<InventoryItemDto> findByCategory(String category) {
        return inventoryItemRepository.findByCategory(category)
                .stream()
                .map(inventoryItemMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<InventoryItemDto> findById(Integer id) {
        return inventoryItemRepository.findById(id)
                .map(inventoryItemMapper::toDto);
    }

    public InventoryItemDto create(InventoryItemDto dto) {
        InventoryItem entity = inventoryItemMapper.toEntity(dto);
        return inventoryItemMapper.toDto(inventoryItemRepository.save(entity));
    }

    public Optional<InventoryItemDto> update(Integer id, InventoryItemDto dto) {
        if (!inventoryItemRepository.existsById(id))
            return Optional.empty();

        InventoryItem entity = inventoryItemMapper.toEntity(dto);
        entity.setItemId(id);

        return Optional.of(inventoryItemMapper.toDto(inventoryItemRepository.save(entity)));
    }

    public boolean deleteById(Integer id) {
        if (!inventoryItemRepository.existsById(id))
            return false;

        inventoryItemRepository.deleteById(id);
        return true;
    }

    public List<Map<String, Object>> getAllFertilizers() {

        List<InventoryItem> items = inventoryItemRepository.findByCategory("Fertilizer");

        List<Map<String, Object>> result = new ArrayList<>();

        for (InventoryItem item : items) {

            for (InventoryBatch batch : item.getBatches()) {

                Map<String, Object> map = new HashMap<>();
                map.put("id", batch.getBatchInvId());
                map.put("itemId", item.getItemId());
                map.put("name", item.getItemName());
                map.put("unit", item.getUnit());

                map.put("supplier", batch.getSupplier());
                map.put("quantity", batch.getQuantity());
                map.put("receivedDate", batch.getReceivedDate());
                map.put("expiryDate", batch.getExpiryDate());
                map.put("productionDate", batch.getProductionDate());

                result.add(map);
            }
        }

        return result;
    }

    public List<Map<String, Object>> getAllPesticides() {

        List<InventoryItem> items = inventoryItemRepository.findByCategory("Pesticide");

        List<Map<String, Object>> result = new ArrayList<>();

        for (InventoryItem item : items) {

            for (InventoryBatch batch : item.getBatches()) {

                Map<String, Object> map = new HashMap<>();
                map.put("id", batch.getBatchInvId());
                map.put("itemId", item.getItemId());
                map.put("name", item.getItemName());
                map.put("unit", item.getUnit());

                map.put("supplier", batch.getSupplier());
                map.put("quantity", batch.getQuantity());
                map.put("receivedDate", batch.getReceivedDate());
                map.put("expiryDate", batch.getExpiryDate());
                map.put("productionDate", batch.getProductionDate());

                result.add(map);
            }
        }

        return result;
    }

    public Map<String, Object> createFertilizer(CreateFertilizerRequest req) {
        // 🔍 Tìm item đã tồn tại chưa
        Optional<InventoryItem> existing = inventoryItemRepository.findByItemNameAndCategory(
                req.getName(),
                req.getCategory());

        InventoryItem item;

        // ✅ Nếu có rồi thì dùng lại
        if (existing.isPresent()) {
            item = existing.get();
        } else {
            // ✅ Nếu chưa có thì tạo mới
            item = new InventoryItem();
            item.setItemName(req.getName());
            item.setCategory(req.getCategory());
            item.setUnit(req.getUnit());
            item.setMinThreshold(0.0);

            Crop crop = new Crop();
            crop.setCropId(3); // hardcode tạm
            item.setCrop(crop);

            item = inventoryItemRepository.save(item);
        }

        // 👉 Tạo batch
        InventoryBatch batch = new InventoryBatch();
        batch.setItem(item);
        batch.setSupplier(req.getSupplier());
        batch.setQuantity(req.getQuantity());

        // ✅ Expiry Date (date)
        if (req.getExpiryDate() != null && !req.getExpiryDate().isEmpty()) {
            batch.setExpiryDate(LocalDate.parse(req.getExpiryDate()));
        }

        // ✅ Production Date (date)
        if (req.getProductionDate() != null && !req.getProductionDate().isEmpty()) {
            batch.setProductionDate(LocalDate.parse(req.getProductionDate()));
        }

        // 🔥 FIX CHÍNH Ở ĐÂY (datetime)
        if (req.getReceivedDate() != null && !req.getReceivedDate().isEmpty()) {
            batch.setReceivedDate(LocalDateTime.parse(req.getReceivedDate()));
        }

        batchRepo.save(batch);
        Map<String, Object> result = new HashMap<>();
        result.put("id", batch.getBatchInvId());
        result.put("itemId", item.getItemId()); // 🔥 QUAN TRỌNG
        result.put("name", item.getItemName());
        result.put("unit", item.getUnit());
        result.put("supplier", batch.getSupplier());
        result.put("quantity", batch.getQuantity());
        result.put("receivedDate", batch.getReceivedDate());
        result.put("expiryDate", batch.getExpiryDate());
        result.put("productionDate", batch.getProductionDate());
        return result;
    }

    @Transactional
    public void updateFertilizer(Integer batchId, CreateFertilizerRequest req) {
        InventoryBatch batch = batchRepo.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lô hàng với ID: " + batchId));

        InventoryItem item = batch.getItem();
        if (item != null) {
            if (req.getName() != null && !req.getName().isEmpty()) {
                item.setItemName(req.getName());
            }
            if (req.getUnit() != null && !req.getUnit().isEmpty()) {
                item.setUnit(req.getUnit());
            }
            inventoryItemRepository.save(item);
        }

        batch.setSupplier(req.getSupplier());
        batch.setQuantity(req.getQuantity());

        if (req.getProductionDate() != null && !req.getProductionDate().isEmpty()) {
            batch.setProductionDate(parseSafeLocalDate(req.getProductionDate()));
        }

        if (req.getExpiryDate() != null && !req.getExpiryDate().isEmpty()) {
            batch.setExpiryDate(parseSafeLocalDate(req.getExpiryDate()));
        }

        if (req.getReceivedDate() != null && !req.getReceivedDate().isEmpty()) {
            batch.setReceivedDate(parseSafeLocalDateTime(req.getReceivedDate()));
        }

        batchRepo.save(batch);
    }

    private LocalDate parseSafeLocalDate(String dateStr) {
        if (dateStr.contains("T")) {
            return LocalDateTime.parse(dateStr).toLocalDate();
        }
        return LocalDate.parse(dateStr);
    }

    private LocalDateTime parseSafeLocalDateTime(String dateStr) {
        if (dateStr.contains("T")) {
            return LocalDateTime.parse(dateStr);
        }
        return LocalDate.parse(dateStr).atStartOfDay();
    }

    @Transactional
    public void deleteFertilizer(Integer batchId) {
        InventoryBatch batch = batchRepo.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lô hàng với ID: " + batchId));

        InventoryItem item = batch.getItem();
        batchRepo.delete(batch);
        batchRepo.flush();
        if (item != null) {
            boolean hasOther = batchRepo.existsByItem(item);
            if (!hasOther) {
                inventoryItemRepository.delete(item);
            }
        }
    }
}