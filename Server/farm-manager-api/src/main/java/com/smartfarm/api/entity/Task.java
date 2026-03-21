package com.smartfarm.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "Tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long taskId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_batch_id")
    private PlantingBatch plantingBatch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_tmp_id")
    private TaskTemplate taskTemplate;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "planned_date", nullable = false)
    private LocalDate plannedDate;

    @Column(name = "actual_date")
    private LocalDate actualDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "status")
    private String status;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
