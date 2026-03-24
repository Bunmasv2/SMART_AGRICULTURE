package com.smartfarm.api.repository;

import com.smartfarm.api.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Integer> {
    List<InventoryItem> findByCategory(String category);

    Optional<InventoryItem> findByItemNameAndCategory(String name, String category);
}