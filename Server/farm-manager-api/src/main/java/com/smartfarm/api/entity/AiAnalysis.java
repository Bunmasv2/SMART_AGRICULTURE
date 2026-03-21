package com.smartfarm.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "AI_Analysis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Long analysisId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_batch_id")
    private PlantingBatch plantingBatch;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "result_json", columnDefinition = "JSON")
    private String resultJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
