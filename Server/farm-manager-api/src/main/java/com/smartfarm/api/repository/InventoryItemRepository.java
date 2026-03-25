package com.smartfarm.api.repository;

import com.smartfarm.api.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Integer> {
    List<InventoryItem> findByCategory(String category);

    Optional<InventoryItem> findByItemNameAndCategory(String name, String category);
  
    @Query("SELECT i FROM InventoryItem i WHERE i.minThreshold > 0 AND " +
           "(SELECT SUM(b.quantity) FROM InventoryBatch b WHERE b.item = i) <= i.minThreshold")
    List<InventoryItem> findLowStockItems();
}

