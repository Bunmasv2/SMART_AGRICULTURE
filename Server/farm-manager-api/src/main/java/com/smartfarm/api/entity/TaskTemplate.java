package com.smartfarm.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Task_Templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_tmp_id")
    private Integer taskTmpId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id")
    private Stage stage;

    @Column(name = "task_name", nullable = false, length = 100)
    private String taskName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private InventoryItem item;

    @Column(name = "quantity_required")
    private Double quantityRequired;

    @Column(name = "offset_day")
    private Integer offsetDay;
}
