package com.smartfarm.api.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private Integer stageId;

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

    public Integer getStageId() {
        return stageId;
    }

    public String getStageName() {
        return stageName;
    }
}
