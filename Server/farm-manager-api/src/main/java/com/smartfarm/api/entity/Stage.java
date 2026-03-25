package com.smartfarm.api.entity;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Stages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stage_id")
    private Long stageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    private GrowthProcess process;

    @Column(name = "stage_name", nullable = false, length = 100)
    private String stageName;

    @Column(name = "start_day", nullable = false)
    private Integer startDay;

    @Column(name = "end_day", nullable = false)
    private Integer endDay;

    @OneToMany(mappedBy = "stage", fetch = FetchType.LAZY)
    private List<TaskTemplate> taskTemplates;
}
