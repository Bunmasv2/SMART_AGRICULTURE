package com.smartfarm.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Inventory_Items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    @Column(name = "min_threshold")
    private Double minThreshold;
}
