package com.smartfarm.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

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
    private Long pBatchId;

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
}
