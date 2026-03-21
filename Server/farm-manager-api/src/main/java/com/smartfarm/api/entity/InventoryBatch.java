package com.smartfarm.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Inventory_Batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "batch_inv_id")
    private Long batchInvId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private InventoryItem item;

    @Column(name = "supplier", length = 100)
    private String supplier;

    @Column(name = "quantity", nullable = false)
    private Double quantity;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "received_date")
    private LocalDateTime receivedDate;
}
