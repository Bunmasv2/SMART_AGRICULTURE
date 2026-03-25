package com.smartfarm.api.repository;

import com.smartfarm.api.entity.InventoryBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface InventoryBatchRepository extends JpaRepository<InventoryBatch, Integer> {
    List<InventoryBatch> findByItemItemId(Integer itemId);
    List<InventoryBatch> findByItemCategory(String category);
    
    // Tìm các lô đã hết hạn
    List<InventoryBatch> findByExpiryDateBefore(LocalDate date);
    
    // Tìm các lô sắp hết hạn (ví dụ: trong ngày mai đến 30 ngày tới)
    List<InventoryBatch> findByExpiryDateBetween(LocalDate start, LocalDate end);
}
