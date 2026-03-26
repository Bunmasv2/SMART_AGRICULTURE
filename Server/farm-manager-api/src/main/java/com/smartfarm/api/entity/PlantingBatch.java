package com.smartfarm.api.entity;

import java.time.LocalDate;

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
@Table(name = "Planting_Batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlantingBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "p_batch_id")
    private Integer pBatchId;

    @Column(name = "batch_name", nullable = false, length = 100)
    private String batchName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id")
    private Crop crop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    private GrowthProcess process;

    @Column(name = "area_m2")
    private Double areaM2;

    @Column(name = "crop_count")
    private Integer cropCount;

    @Column(name = "location_coords")
    private String locationCoords;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "status")
    private String status;

    public void setpBatchId(Integer id) {
        this.pBatchId = id;
    }

    public Integer getPBatchId() {
        return pBatchId;
    }

    public String getBatchName() {
        return batchName;
    }
}
