package com.smartfarm.api.repository;

import com.smartfarm.api.entity.InventoryBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryBatchRepository extends JpaRepository<InventoryBatch, Long> {
    List<InventoryBatch> findByItemItemId(Long itemId);
    List<InventoryBatch> findByItemCategory(String category);
}
