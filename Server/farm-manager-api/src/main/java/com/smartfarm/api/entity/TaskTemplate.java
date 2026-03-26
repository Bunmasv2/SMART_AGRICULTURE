package com.smartfarm.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    public Integer getTaskTmpId() {
        return taskTmpId;
    }

    public void setTaskTmpId(Integer taskTmpId) {
        this.taskTmpId = taskTmpId;
    }

    public Stage getStage() {
        return stage;
    }

    public String getTaskName() {
        return taskName;
    }
}
