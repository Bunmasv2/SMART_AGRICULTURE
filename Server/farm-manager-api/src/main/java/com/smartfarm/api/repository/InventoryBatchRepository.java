package com.smartfarm.api.repository;

import com.smartfarm.api.entity.InventoryBatch;
import com.smartfarm.api.entity.InventoryItem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface InventoryBatchRepository extends JpaRepository<InventoryBatch, Integer> {
    List<InventoryBatch> findByItemItemId(Integer itemId);

    List<InventoryBatch> findByItemCategory(String category);

    @Query("""
                SELECT SUM(b.quantity) FROM InventoryBatch b
                WHERE b.item.itemId = :itemId
            """)
    Double getTotalStock(Long itemId);

    boolean existsByItem(InventoryItem item);

    List<InventoryBatch> findByItem_ItemId(Integer itemId);
}